/**
 * Palace definitions — the 12 palaces with English translations and grid positions.
 * The traditional layout arranges them in a 4×4 grid as follows:
 *
 *       巳(5)      午(6)      未(7)      申(8)
 *    ┌─────────┬─────────┬─────────┬─────────┐
 *    │  交友   │  事業   │  田宅   │  福德   │
 *    │ Friends │ Career  │Property │ Fortune │
 *    ├─────────┼─────────┴─────────┼─────────┤
 * 辰 │  遷移   │                  │  父母   │ 酉
 * (4)│ Travel  │    CHART INFO    │ Parents │ (9)
 *    ├─────────┤                  ├─────────┤
 * 卯 │  疾厄   │   (center area)  │  命宮   │ 戌
 * (3)│ Health  │                  │ Destiny │ (10)
 *    ├─────────┼─────────┬─────────┼─────────┤
 *    │  財帛   │  子女   │  夫妻   │  兄弟   │
 *    │ Wealth  │Children │ Spouse  │Siblings │
 *    └─────────┴─────────┴─────────┴─────────┘
 *       寅(2)      丑(1)      子(0)      亥(11)
 */

import type { PalaceDefinition, PalaceName } from '../types';

/**
 * Palace display order follows the traditional counter-clockwise
 * arrangement starting from 寅 (Destiny Palace default position).
 *
 * Index 0–11 maps to grid positions as shown above.
 * The `gridRow` and `gridCol` define 1-based CSS grid positions.
 */
export const PALACE_DEFINITIONS: (PalaceDefinition & {
  gridRow: number;
  gridCol: number;
  defaultBranchIndex: number;
})[] = [
  {
    id: 'ming',
    nameZh: '命宮',
    nameEn: 'Destiny Palace',
    shortNameEn: 'Destiny',
    descriptionEn: 'Self, personality, life direction, physical appearance, and overall fortune. The most important palace.',
    descriptionZh: '主自我、性格、人生方向、相貌、整體運勢。',
    index: 0,
    gridRow: 3,
    gridCol: 4,
    defaultBranchIndex: 2, // 寅
  },
  {
    id: 'xiongdi',
    nameZh: '兄弟宮',
    nameEn: 'Siblings Palace',
    shortNameEn: 'Siblings',
    descriptionEn: 'Siblings, close peers, colleagues, and relationships with people of the same generation.',
    descriptionZh: '主兄弟姐妹、同輩、同事、平輩關係。',
    index: 1,
    gridRow: 4,
    gridCol: 4,
    defaultBranchIndex: 1, // 丑
  },
  {
    id: 'fuqi',
    nameZh: '夫妻宮',
    nameEn: 'Spouse Palace',
    shortNameEn: 'Spouse',
    descriptionEn: 'Marriage, spouse, romantic partnerships, and relationship dynamics.',
    descriptionZh: '主婚姻、配偶、感情伴侶、戀愛關係。',
    index: 2,
    gridRow: 4,
    gridCol: 3,
    defaultBranchIndex: 0, // 子
  },
  {
    id: 'zinv',
    nameZh: '子女宮',
    nameEn: 'Children Palace',
    shortNameEn: 'Children',
    descriptionEn: 'Children, offspring, creativity, pleasures, and sexual life.',
    descriptionZh: '主子女、後代、創意、享樂、性生活。',
    index: 3,
    gridRow: 4,
    gridCol: 2,
    defaultBranchIndex: 11, // 亥
  },
  {
    id: 'caibo',
    nameZh: '財帛宮',
    nameEn: 'Wealth Palace',
    shortNameEn: 'Wealth',
    descriptionEn: 'Income, earning ability, financial management, and material resources.',
    descriptionZh: '主財運、賺錢能力、理財方式、物質資源。',
    index: 4,
    gridRow: 4,
    gridCol: 1,
    defaultBranchIndex: 10, // 戌
  },
  {
    id: 'jie',
    nameZh: '疾厄宮',
    nameEn: 'Health Palace',
    shortNameEn: 'Health',
    descriptionEn: 'Physical health, illness tendencies, accidents, and overall wellbeing.',
    descriptionZh: '主身體健康、疾病傾向、意外、身心狀態。',
    index: 5,
    gridRow: 3,
    gridCol: 1,
    defaultBranchIndex: 9, // 酉
  },
  {
    id: 'qianyi',
    nameZh: '遷移宮',
    nameEn: 'Travel Palace',
    shortNameEn: 'Travel',
    descriptionEn: 'Travel, relocation, external environment, and how one is perceived by outsiders.',
    descriptionZh: '主外出、搬遷、外在環境、外人眼中形象。',
    index: 6,
    gridRow: 2,
    gridCol: 1,
    defaultBranchIndex: 8, // 申
  },
  {
    id: 'jiaoyou',
    nameZh: '交友宮',
    nameEn: 'Friends Palace',
    shortNameEn: 'Friends',
    descriptionEn: 'Friends, social circle, subordinates, servants, and networking.',
    descriptionZh: '主朋友、社交圈、下屬、僕人、人脈。',
    index: 7,
    gridRow: 1,
    gridCol: 1,
    defaultBranchIndex: 7, // 未
  },
  {
    id: 'shiye',
    nameZh: '事業宮',
    nameEn: 'Career Palace',
    shortNameEn: 'Career',
    descriptionEn: 'Career, profession, social status, achievements, and public reputation.',
    descriptionZh: '主事業、職業、社會地位、成就、名聲。',
    index: 8,
    gridRow: 1,
    gridCol: 2,
    defaultBranchIndex: 6, // 午
  },
  {
    id: 'tianzhai',
    nameZh: '田宅宮',
    nameEn: 'Property Palace',
    shortNameEn: 'Property',
    descriptionEn: 'Home, real estate, family environment, and living conditions.',
    descriptionZh: '主房產、家庭環境、居住條件、不動產。',
    index: 9,
    gridRow: 1,
    gridCol: 3,
    defaultBranchIndex: 5, // 巳
  },
  {
    id: 'fude',
    nameZh: '福德宮',
    nameEn: 'Fortune Palace',
    shortNameEn: 'Fortune',
    descriptionEn: 'Inner happiness, spiritual wellbeing, enjoyment, and karmic blessings.',
    descriptionZh: '主內心快樂、精神享受、福氣、祖蔭。',
    index: 10,
    gridRow: 1,
    gridCol: 4,
    defaultBranchIndex: 4, // 辰
  },
  {
    id: 'fumu',
    nameZh: '父母宮',
    nameEn: 'Parents Palace',
    shortNameEn: 'Parents',
    descriptionEn: 'Parents, elders, superiors, teachers, and authority figures.',
    descriptionZh: '主父母、長輩、上司、老師、權威人物。',
    index: 11,
    gridRow: 2,
    gridCol: 4,
    defaultBranchIndex: 3, // 卯
  },
];

export const PALACE_BY_ID: Partial<Record<PalaceName, (typeof PALACE_DEFINITIONS)[number]>> = {};
for (const p of PALACE_DEFINITIONS) {
  PALACE_BY_ID[p.id] = p;
}

/** Palace ordering: given 命宮 at branch index `mingBranch` (0–11),
 *  return which PalaceName occupies each of the 12 branches.
 *  Palaces are placed counter-clockwise from 命宮. */
export function getPalaceOrder(mingBranchIndex: number): PalaceName[] {
  // The 12 palaces are placed in this fixed order, counter-clockwise
  const order: PalaceName[] = [
    'ming', 'xiongdi', 'fuqi', 'zinv', 'caibo',
    'jie', 'qianyi', 'jiaoyou', 'shiye', 'tianzhai',
    'fude', 'fumu',
  ];
  // Rotate so that 'ming' aligns with mingBranchIndex
  // The default ming branch is 寅 (index 2), so we offset accordingly
  const result: PalaceName[] = [];
  for (let i = 0; i < 12; i++) {
    const branchIdx = (mingBranchIndex - i + 12) % 12; // counter-clockwise
    // Find which palace goes to this branch
    // In default: ming(2), xiongdi(1), fuqi(0), zinv(11), caibo(10)...
    result[branchIdx] = order[i];
  }
  return result;
}
