import React, { useEffect, useState } from 'react'
import { useDispatch, useStore } from 'react-redux'
import styled from 'styled-components'

import * as color from './color'
import { SearchIcon as _SearchIcon } from './icon'

export function CardFilter() {
  const store = useStore()
  const dispatch = useDispatch()
  const [value, setValue] = useState('')

  // 機能的に必須ではないが、状態管理のため、
  // Redux ストアに変化があるたび最新の filterValue を取得。
  useEffect(
    () =>
      store.subscribe(() => {
        const { filterValue } = store.getState()
        if (value === filterValue) return

        setValue(filterValue)
      }),
    [store, value],
  )

  // ####Debounce
  // 頻繁なrenderingを抑止すること。
  // ここでは遅延時間(400ms)を設けることで、
  // filterへの文字入力にともなうrenderingの回数を抑止している。
  useEffect(() => {
    const timer = setTimeout(
      () =>
        dispatch({
          type: 'Filter.SetFilter',
          payload: {
            value,
          },
        }),
      400,
    )
    // 400 ミリ秒経過前に再び value が変化したら以前の setTimeout 処理をキャンセル。
    return () => clearTimeout(timer)
  }, [dispatch, value])

  return (
    <Container>
      <SearchIcon />
      <Input
        placeholder="Filter cards"
        value={value}
        onChange={ev => setValue(ev.currentTarget.value)}
      />
    </Container>
  )
}

const Container = styled.label`
  display: flex;
  align-items: center;
  min-width: 300px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
`

const SearchIcon = styled(_SearchIcon)`
  margin: 0 4px 0 8px;
  font-size: 16px;
  color: ${color.Silver};
`

const Input = styled.input.attrs({ type: 'search' })`
  width: 100%;
  padding: 6px 8px 6px 0;
  color: ${color.White};
  font-size: 14px;

  :focus {
    outline: none;
  }
`
