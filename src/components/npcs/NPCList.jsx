import NPC from './NPC'
import { NPC_DATA } from '../../data/npcs'

export default function NPCList() {
  return (
    <>
      {NPC_DATA.map((npc) => (
        <NPC key={npc.id} {...npc} />
      ))}
    </>
  )
}
