import React, { useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import styled from 'styled-components'

import { api } from './api'
import { Column } from './Column'
import { DeleteDialog } from './DeleteDialog'
// styled-componentsを適用するため、名前変更。
import { Header as _Header } from './Header'
import { Overlay as _Overlay } from './Overlay'

export function App() {
  const dispatch = useDispatch()

  // // 初期値 => db.jsonで管理するためコメントアウト
  // const [columns, setColumns] = useState([
  //   {
  //     id: 'A',
  //     title: 'TODO',
  //     text: '',
  //     cards: [
  //       { id: 'a', text: '朝食をとる🍞' },
  //       { id: 'b', text: 'SNSをチェックする🐦' },
  //       { id: 'c', text: '布団に入る (:3[___]' },
  //     ],
  //   },
  //   {
  //     id: 'B',
  //     title: 'Doing',
  //     text: '',
  //     cards: [
  //       { id: 'd', text: '顔を洗う👐' },
  //       { id: 'e', text: '歯を磨く🦷' },
  //     ],
  //   },
  //   {
  //     id: 'C',
  //     title: 'Waiting',
  //     text: '',
  //     cards: [],
  //   },
  //   {
  //     id: 'D',
  //     title: 'Done',
  //     text: '',
  //     cards: [{ id: 'f', text: '布団から出る (:3っ)っ -=三[＿＿]' }],
  //   },
  // ])

  const columns = useSelector(
    state => state.columns?.map(v => v.id),
    shallowEqual,
  )

  useEffect(() => {
    ;(async () => {
      const columns = await api('GET /v1/columns', null)

      dispatch({
        type: 'App.SetColumns',
        payload: {
          columns,
        },
      })

      const [unorderedCards, cardsOrder] = await Promise.all([
        api('GET /v1/cards', null),
        api('GET /v1/cardsOrder', null),
      ])

      dispatch({
        type: 'App.SetCards',
        payload: {
          cards: unorderedCards,
          cardsOrder,
        },
      })
    })()
  }, [dispatch])

  // const dropCardTo = (toID: CardID | ColumnID) => {
  //   const fromID = draggingCardID
  //   if (!fromID) return

  //   if (fromID === toID) return

  //   const patch = reorderPatch(cardsOrder, fromID, toID)

  // immer未使用version
  // ==============================
  // setColumns(columns => {
  //   // ####Array.prototype.flatMap()
  //   // それぞれの要素をマップした後、新しい配列内にフラット化して返す。
  //   // map()と似ているが、flatMap()は名の通りネストのないflatなarrを必ず返す。
  //   // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
  //   const card = columns.flatMap(col => col.cards).find(c => c.id === fromID)
  //   if (!card) {
  //     return columns
  //   }

  //   return columns.map(column => {
  //     let newColumn = column

  //     if (newColumn.cards.some(c => c.id === fromID)) {
  //       newColumn = {
  //         ...newColumn,
  //         cards: newColumn.cards.filter(c => c.id !== fromID),
  //       }
  //     }

  //     // 列の末尾に移動
  //     if (newColumn.id === toID) {
  //       newColumn = {
  //         ...newColumn,
  //         cards: [...newColumn.cards, card],
  //       }
  //     }
  //     // 列の末尾以外に移動
  //     // ####some()
  //     // 配列の少なくとも一つの要素が、指定された関数で実装されたテストに合格するかどうかをテストします。
  //     // 配列内の少なくとも1つの要素でコールバック関数が真と解釈される値を返した場合は true です。
  //     // それ以外は false です。
  //     else if (newColumn.cards.some(c => c.id === toID)) {
  //       newColumn = {
  //         ...newColumn,
  //         cards: newColumn.cards.flatMap(c =>
  //           c.id === toID ? [card, c] : [c],
  //         ),
  //       }
  //     }

  //     return newColumn
  //   })
  // })
  // ==============================

  // 上記codeをImmerで変換
  // ####Immer
  // イミュータブルでない操作をイミュータブルな結果に変換するライブラリー。
  // setData(
  //   produce((draft: State) => {
  // const card = draft.columns
  //   ?.flatMap(col => col.cards ?? [])
  //   .find(c => c.id === fromID)
  // if (!card) return

  // const fromColumn = draft.columns?.find(col =>
  //   col.cards?.some(c => c.id === fromID),
  // )
  // if (!fromColumn?.cards) return

  // fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromID)

  // const toColumn = draft.columns?.find(
  //   col => col.id === toID || col.cards?.some(c => c.id === toID),
  // )
  // if (!toColumn?.cards) return

  // let index = toColumn.cards.findIndex(c => c.id === toID)
  // if (index < 0) {
  //   index = toColumn.cards.length
  // }
  // toColumn.cards.splice(index, 0, card)
  //     draft.cardsOrder = {
  //       ...draft.cardsOrder,
  //       ...patch,
  //     }

  //     const unorderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
  //     draft.columns?.forEach(column => {
  //       column.cards = sortBy(unorderedCards, draft.cardsOrder, column.id)
  //     })
  //   }),
  // )

  //   dispatch({
  //     type: 'Card.Drop',
  //     payload: {
  //       toID,
  //     },
  //   })

  //   api('PATCH /v1/cardsOrder', patch)
  // }

  return (
    <Container>
      <Header />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(id => <Column key={id} id={id} />)
          )}
        </HorizontalScroll>
      </MainArea>

      <DialogOverlay />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`

const Header = styled(_Header)`
  /* ####flex-shrink */
  /* ボックス内の子要素の圧縮率を指定。0だと圧縮しない。 */
  flex-shrink: 0;
`

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  /* ####> => 直下の子要素 */
  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }
  /* ####:: => 疑似要素。::after => 要素の直後にコンテンツを追加。 */
  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`

function DialogOverlay() {
  const dispatch = useDispatch()
  const cardIsBeingDeleted = useSelector(state => Boolean(state.deletingCardID))

  const cancelDelete = () =>
    dispatch({
      type: 'Dialog.CancelDelete',
    })

  if (!cardIsBeingDeleted) {
    return null
  }

  return (
    <Overlay onClick={cancelDelete}>
      <DeleteDialog />
    </Overlay>
  )
}

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
