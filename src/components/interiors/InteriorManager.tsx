import FurnitureItem from './FurnitureItem'
import {
  ReceptionDesk,
  ComputerDesk,
  TradingDesk,
  TickerBoard,
  BankCounter,
  OfficeChair,
} from './Primitives'

/**
 * InteriorManager renders primitive furniture for each FinQuest zone.
 * Each item has Leva transform controls for positioning.
 * Use the Leva panel to position items, then click "Save Transform"
 * to persist to localStorage. The alert will show exact values to hardcode.
 */
export default function InteriorManager() {
  return (
    <>
      {/* ═══════════════════════════════════════ */}
      {/* TECHCORP HQ (tallstore) — Office vibe  */}
      {/* ═══════════════════════════════════════ */}
      <FurnitureItem
        id="techcorp_reception"
        name="Reception Desk"
        folder="TechCorp Interior"
        defaultPosition={[140, 3, -70]}
        defaultRotation={[0, 0, 0]}
      >
        <ReceptionDesk />
      </FurnitureItem>

      <FurnitureItem
        id="techcorp_desk1"
        name="Computer Desk 1"
        folder="TechCorp Interior"
        defaultPosition={[138, 3, -75]}
        defaultRotation={[0, 0, 0]}
      >
        <ComputerDesk />
      </FurnitureItem>

      <FurnitureItem
        id="techcorp_desk2"
        name="Computer Desk 2"
        folder="TechCorp Interior"
        defaultPosition={[142, 3, -75]}
        defaultRotation={[0, 0, 0]}
      >
        <ComputerDesk />
      </FurnitureItem>

      <FurnitureItem
        id="techcorp_desk3"
        name="Computer Desk 3"
        folder="TechCorp Interior"
        defaultPosition={[138, 3, -78]}
        defaultRotation={[0, 0, 0]}
      >
        <ComputerDesk />
      </FurnitureItem>

      <FurnitureItem
        id="techcorp_desk4"
        name="Computer Desk 4"
        folder="TechCorp Interior"
        defaultPosition={[142, 3, -78]}
        defaultRotation={[0, 0, 0]}
      >
        <ComputerDesk />
      </FurnitureItem>

      {/* ═══════════════════════════════════════ */}
      {/* FINQUEST BANK (cylinderstore) — Bank    */}
      {/* ═══════════════════════════════════════ */}
      <FurnitureItem
        id="bank_counter"
        name="Bank Counter"
        folder="Bank Interior"
        defaultPosition={[140, 3, 10]}
        defaultRotation={[0, 0, 0]}
      >
        <BankCounter />
      </FurnitureItem>

      <FurnitureItem
        id="bank_reception"
        name="Bank Reception"
        folder="Bank Interior"
        defaultPosition={[143, 3, 15]}
        defaultRotation={[0, Math.PI / 2, 0]}
      >
        <ReceptionDesk />
      </FurnitureItem>

      <FurnitureItem
        id="bank_chair1"
        name="Waiting Chair 1"
        folder="Bank Interior"
        defaultPosition={[137, 3, 14]}
        defaultRotation={[0, 0, 0]}
      >
        <OfficeChair />
      </FurnitureItem>

      <FurnitureItem
        id="bank_chair2"
        name="Waiting Chair 2"
        folder="Bank Interior"
        defaultPosition={[137, 3, 16]}
        defaultRotation={[0, 0, 0]}
      >
        <OfficeChair />
      </FurnitureItem>

      {/* ═══════════════════════════════════════ */}
      {/* STOCK EXCHANGE (domestore) — Trading    */}
      {/* ═══════════════════════════════════════ */}
      <FurnitureItem
        id="stock_tradingdesk1"
        name="Trading Desk 1"
        folder="Stock Exchange Interior"
        defaultPosition={[-125, 3, -25]}
        defaultRotation={[0, 0, 0]}
      >
        <TradingDesk />
      </FurnitureItem>

      <FurnitureItem
        id="stock_tradingdesk2"
        name="Trading Desk 2"
        folder="Stock Exchange Interior"
        defaultPosition={[-125, 3, -30]}
        defaultRotation={[0, 0, 0]}
      >
        <TradingDesk />
      </FurnitureItem>

      <FurnitureItem
        id="stock_ticker"
        name="Ticker Board"
        folder="Stock Exchange Interior"
        defaultPosition={[-125, 5, -35]}
        defaultRotation={[0, 0, 0]}
      >
        <TickerBoard />
      </FurnitureItem>

      <FurnitureItem
        id="stock_reception"
        name="Stock Reception"
        folder="Stock Exchange Interior"
        defaultPosition={[-122, 3, -20]}
        defaultRotation={[0, -Math.PI / 4, 0]}
      >
        <ReceptionDesk />
      </FurnitureItem>
    </>
  )
}
