import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { api, CardID, ColumnID } from './api'
import * as color from './color'
import { CheckIcon as _CheckIcon, TrashIcon } from './icon'
import { reorderPatch } from './util'

// export対象のCardコンポーネントのプロパティとして、DropAreaコンポーネントを代入。
// import先で<Card.DropArea>として利用できる。
Card.DropArea = DropArea

export function Card({ id }: { id: CardID }) {
  const dispatch = useDispatch()
  const card = useSelector(state =>
    state.columns?.flatMap(c => c.cards ?? []).find(c => c.id === id),
  )
  const drag = useSelector(state => state.draggingCardID === id)

  const onDeleteClick = () =>
    dispatch({
      type: 'Card.SetDeletingCard',
      payload: {
        cardID: id,
      },
    })

  if (!card) {
    return null
  }
  const { text } = card

  return (
    <Container
      // ####opacity => 透明度
      style={{ opacity: drag ? 0.5 : undefined }}
      onDragStart={() => {
        dispatch({
          type: 'Card.StartDragging',
          payload: {
            cardID: id,
          },
        })
      }}
      onDragEnd={() => {
        dispatch({
          type: 'Card.EndDragging',
        })
      }}
    >
      <CheckIcon />

      {/* ####文字列.split() => 指定した値で区切った文字列をarrで返す。
        💡💡split(/(xxx)/g)のように、正規表現を()でwrapすると、
          正規表現の値も返り値のarrに含まれる。
          文字列の頭が正規表現でも、返り値のarrのindex[0]は""となるので、
          正規表現のindexは必ずoddになる。"
          今回はそれを利用してhttp(s)://の文字列にリンクを作成。 */}
      {/* \S => すべての非空白文字 */}
      {text?.split(/(https?:\/\/\S+)/g).map((fragment, i) =>
        i % 2 === 0 ? (
          <Text key={i}>{fragment}</Text>
        ) : (
          <Link key={i} href={fragment}>
            {fragment}
          </Link>
        ),
      )}

      <DeleteButton onClick={onDeleteClick} />
    </Container>
  )
}

// ####attrs() => defaultの属性を指定。
// https://styled-components.com/docs/basics#attaching-additional-props
const Container = styled.div.attrs({
  draggable: true,
})`
  position: relative;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.1);
  padding: 8px 32px;
  background-color: ${color.White};
  cursor: move;
`

const CheckIcon = styled(_CheckIcon)`
  position: absolute;
  top: 12px;
  left: 8px;
  color: ${color.Green};
`

const DeleteButton = styled.button.attrs({
  type: 'button',
  children: <TrashIcon />,
})`
  position: absolute;
  top: 12px;
  right: 8px;
  font-size: 14px;
  color: ${color.Gray};

  :hover {
    color: ${color.Red};
  }
`

const Text = styled.span`
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`

const Link = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  color: ${color.Blue};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`

function DropArea({
  targetID: toID,
  disabled,
  children,
  className,
  style,
}: {
  targetID: CardID | ColumnID
  disabled?: boolean
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const dispatch = useDispatch()
  const draggingCardID = useSelector(state => state.draggingCardID)
  const cardsOrder = useSelector(state => state.cardsOrder)
  const [isTarget, setIsTarget] = useState(false)
  const visible = !disabled && isTarget

  const [dragOver, onDragOver] = useDragAutoLeave()

  return (
    <DropAreaContainer
      style={style}
      className={className}
      onDragOver={ev => {
        if (disabled) return

        ev.preventDefault()
        onDragOver(() => setIsTarget(false))
      }}
      onDragEnter={() => {
        if (disabled || dragOver.current) return

        setIsTarget(true)
      }}
      onDrop={() => {
        if (disabled) return
        if (!draggingCardID || draggingCardID === toID) return

        dispatch({
          type: 'Card.Drop',
          payload: {
            toID,
          },
        })

        const patch = reorderPatch(cardsOrder, draggingCardID, toID)
        api('PATCH /v1/cardsOrder', patch)

        setIsTarget(false)
      }}
    >
      <DropAreaIndicator
        style={{
          height: !visible ? 0 : undefined,
          borderWidth: !visible ? 0 : undefined,
        }}
      />

      {children}
    </DropAreaContainer>
  )
}

// ####カスタムhook
/**
 * dragOver イベントが継続中かどうかのフラグを ref として返す
 *
 * timeout 経過後に自動でフラグが false になる
 *
 * @param timeout 自動でフラグを false にするまでの時間 (ms)
 */
function useDragAutoLeave(timeout: number = 100) {
  // ここでのuseRefは、DOMではなく、ただ単にmutable(可変)な値を設定している。
  // DOMの場合となんら変わりなく、.currentプロパティに現在の値が保持される。
  const dragOver = useRef(false)
  const timer = useRef(0)

  return [
    dragOver,

    /**
     * @param onDragLeave フラグが false になるときに呼ぶコールバック
     */
    (onDragLeave?: () => void) => {
      // ####clearTimeout()
      // setTimeout() の呼び出しによって以前に確立されたタイムアウトを解除する。
      // para => timeoutID。setTimeout()の返り値によって取得可能。
      clearTimeout(timer.current)

      dragOver.current = true
      timer.current = setTimeout(() => {
        dragOver.current = false
        onDragLeave?.()
      }, timeout)
    },
    // const assertionでreadonlyのタプル型に設定。
  ] as const
}

const DropAreaContainer = styled.div`
  > :not(:first-child) {
    margin-top: 8px;
  }
`

const DropAreaIndicator = styled.div`
  height: 40px;
  border: dashed 3px ${color.Gray};
  border-radius: 6px;
  transition: all 50ms ease-out;
`
