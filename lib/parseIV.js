/* eslint-disable no-bitwise */

const MASK_ATK = 0xf00;
const MASK_DEF = 0x0f0;
const MASK_STA = 0x00f;

function parseIV(iv) {
  return {
    atk: (iv & MASK_ATK) >> 8,
    def: (iv & MASK_DEF) >> 4,
    sta: iv & MASK_STA,
  };
}

module.exports = parseIV;
