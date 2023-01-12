
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';

contract AvgTick 
{
 function getaveragetick(uint160 _sqrtPriceX96) external view returns(int24)
 {
      return TickMath.getTickAtSqrtRatio(_sqrtPriceX96);
 }

}