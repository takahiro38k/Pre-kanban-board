import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { CardFilter } from './CardFilter'

// 💡💡classNameのpropsは、src/App.tsxでstyled(コンポーネント)を定義することで、
// 受け取っている。
// 受け取ったclassNameを指定したコンポーネントにスタイルが反映されるので、
// Containerコンポーネントにsrc/App.tsxで定義したflex-shrink: 0が適用される。
export function Header({
  className,
}: {
  className?: string
}) {
  return (
    <Container className={className}>
      <Logo>Kanban board</Logo>

      <CardFilter />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: ${color.Navy};
`

const Logo = styled.div`
  color: ${color.Silver};
  font-size: 16px;
  font-weight: bold;
`
