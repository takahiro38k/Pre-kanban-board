import React, { useState } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import styled from 'styled-components'

import { ColumnID } from './api'
import { Card } from './Card'
import * as color from './color'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'

export function Column({ id: columnID }: { id: ColumnID }) {
  // ####Nullish Coalescing/Null合体演算子/??
  // undefined or nullだった場合、??の右側の値を返す。
  // const totalCount = rawCards?.length ?? -1

  const { column, cards, filtered, totalCount } = useSelector(
    state => {
      const filterValue = state.filterValue.trim()
      const filtered = Boolean(filterValue)
      const keywords = filterValue.toLowerCase().split(/\s+/g)

      const { title, cards: rawCards } =
        state.columns?.find(c => c.id === columnID) ?? {}

      const column = { title }
      const cards = rawCards
        ?.filter(({ text }) =>
          keywords.every(w => text?.toLowerCase().includes(w)),
        )
        .map(c => c.id)
      const totalCount = rawCards?.length ?? -1

      return { column, cards, filtered, totalCount }
    },
    (left, right) =>
      Object.keys(left).every(key => shallowEqual(left[key], right[key])),
  )
  const draggingCardID = useSelector(state => state.draggingCardID)

  // InputForm の表示・非表示を制御
  const [inputMode, setInputMode] = useState(false)

  // 実行のたびにinputModeのbooleanを入れ替える。
  const toggleInput = () => setInputMode(v => !v)
  const cancelInput = () => setInputMode(false)

  // 初期値(undefined)から型推論ができないので、注釈で指定する。
  // const draggingCardID = useSelector(state => state.draggingCardID)

  if (!column) {
    return null
  }
  const { title } = column

  return (
    <Container>
      <Header>
        {totalCount >= 0 && <CountBadge>{totalCount}</CountBadge>}
        <ColumnName>{title}</ColumnName>

        <AddButton onClick={toggleInput} />
      </Header>

      {inputMode && <InputForm columnID={columnID} onCancel={cancelInput} />}

      {!cards ? (
        <Loading />
      ) : (
        <>
          {filtered && <ResultCount>{cards.length} results</ResultCount>}

          <VerticalScroll>
            {cards.map((id, i) => (
              <Card.DropArea
                key={id}
                targetID={id}
                disabled={
                  draggingCardID !== undefined &&
                  (id === draggingCardID || cards[i - 1] === draggingCardID)
                }
              >
                <Card id={id} />
              </Card.DropArea>
            ))}
            <Card.DropArea
              targetID={columnID}
              style={{ height: '100%' }}
              disabled={
                draggingCardID !== undefined &&
                cards[cards.length - 1] === draggingCardID
              }
            />
          </VerticalScroll>
        </>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  width: 355px;
  height: 100%;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  background-color: ${color.LightSilver};

  /* ####:not(:last-child) => :last-child以外の要素 */
  /* ####:last-child => 疑似クラス。セレクタ内の最後の要素。 */
  > :not(:last-child) {
    flex-shrink: 0;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
`

const CountBadge = styled.div`
  margin-right: 8px;
  border-radius: 20px;
  padding: 2px 6px;
  color: ${color.Black};
  background-color: ${color.Silver};
  font-size: 12px;
  line-height: 1;
`

const ColumnName = styled.div`
  color: ${color.Black};
  font-size: 14px;
  font-weight: bold;
`

const AddButton = styled.button.attrs({
  type: 'button',
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`

const InputForm = styled(_InputForm)`
  padding: 8px;
`

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  padding: 8px;
  font-size: 14px;
`

const ResultCount = styled.div`
  color: ${color.Black};
  font-size: 12px;
  text-align: center;
`

const VerticalScroll = styled.div`
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  flex: 1 1 auto;

  > :not(:first-child) {
    margin-top: 8px;
  }
`
