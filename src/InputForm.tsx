import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { api, CardID, ColumnID } from './api'
import { Button, ConfirmButton } from './Button'
import * as color from './color'
import { randomID, reorderPatch } from './util'

export function InputForm({
  columnID,
  onCancel,
  className,
}: {
  columnID: ColumnID
  onCancel?(): void
  className?: string
}) {
  const dispatch = useDispatch()
  const value = useSelector(
    state => state.columns?.find(c => c.id === columnID)?.text,
  )
  const cardsOrder = useSelector(state => state.cardsOrder)

  const onChange = (value: string) =>
    dispatch({
      type: 'InputForm.SetText',
      payload: {
        columnID,
        value,
      },
    })
  // ####trim()
  // 文字列の両端に空白や改行コードがあれば取り除く。
  // 空白は全角・半角を問わず対象とし、改行コードも種類を問わず対象とする。
  // !value?.trim()
  // --------------------
  // valueがundefined or null or "" or 空白や改行のみの場合、trueを返す。
  // 1. valueがnull or undefinedの場合
  //   Optional Chain(?.)によってnull or undefinedが返り、論理not(!)によってtrueとなる。
  // 2. valueが空白や改行のみの場合
  //   trim()によって""となり、論理not(!)によってtrueとなる。
  // そのほか、なにかしら文字が入力されていれば、論理not(!)によってfalseとなる。
  const disabled = !value?.trim()
  const handleConfirm = () => {
    if (disabled) return
    const text = value

    const cardID = randomID() as CardID

    const patch = reorderPatch(cardsOrder, cardID, cardsOrder[columnID])

    dispatch({
      type: 'InputForm.ConfirmInput',
      payload: {
        columnID,
        cardID,
      },
    })

    api('POST /v1/cards', {
      id: cardID,
      text,
    })
    api('PATCH /v1/cardsOrder', patch)
  }

  // カスタムhookを代入
  const ref = useAutoFitToContentHeight(value)

  return (
    <Container className={className}>
      <Input
        // useRefはref属性で指定する。
        ref={ref}
        autoFocus
        placeholder="Enter a note"
        value={value}
        onChange={ev => onChange(ev.currentTarget.value)}
        onKeyDown={ev => {
          if (!((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter')) return
          handleConfirm()
        }}
      />

      <ButtonRow>
        <AddButton disabled={disabled} onClick={handleConfirm} />
        <CancelButton onClick={onCancel} />
      </ButtonRow>
    </Container>
  )
}

// ####カスタムhook
/**
 * テキストエリアの高さを内容に合わせて自動調整する
 *
 * @param content テキストエリアの内容
 */
function useAutoFitToContentHeight(content: string | undefined) {
  // ####useRef => mutable(可変)な値を保持する箱のようなもの。HTML 要素を指定することが多い。
  // para => 初期値。
  // DOM ノードに変更があるたびに .current プロパティをその DOM ノードに設定する。
  // 保持するDOMが変更されても、再renderは発生しない。
  // ここでは、 HTML 要素の実体（textarea 要素）を保持する箱として使用。
  const ref = useRef<HTMLTextAreaElement>(null)
  // console.log(ref)

  // ####useEffect => 副作用を伴う処理を登録する。
  // 副作用の種類
  //   DOM の操作
  //   API 通信
  //   React 外のライブラリーとの連携
  //   Local storage などの操作
  //   タイマー処理
  //   ロギング
  // など
  useEffect(
    () => {
      const el = ref.current
      // refが初期値(null)の場合は何もしない。
      if (!el) return

      // ####getComputedStyle(el)
      // 指定したel(要素)のすべての CSS プロパティの値を含むオブジェクトを返す。
      // border-top-width => borderTopWidth のように、
      // キャメルケースに自動変換して分割代入できる模様。
      const { borderTopWidth, borderBottomWidth } = getComputedStyle(el)

      // console.log(el.style);

      // ####ElementCSSInlineStyle.style
      // インラインスタイル(タグの中で直接CSSを記入する方法)と同等に、
      // 要素のスタイルを参照したり変更したりする。
      el.style.height = 'auto' // 一度 auto にしないと高さが縮まなくなる
      // ####Element.scrollHeight
      // 領域外で表示されないコンテンツを含む、要素のコンテンツの高さの測定値
      el.style.height = `calc(${borderTopWidth} + ${el.scrollHeight}px + ${borderBottomWidth})`
    },
    // 内容が変わるたびに高さを再計算
    [content],
  )
  return ref
}

const Container = styled.div``

const Input = styled.textarea`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`

const ButtonRow = styled.div`
  display: flex;

  > :not(:first-child) {
    margin-left: 8px;
  }
`

const AddButton = styled(ConfirmButton).attrs({
  children: 'Add',
})``

const CancelButton = styled(Button).attrs({
  children: 'Cancel',
})``
