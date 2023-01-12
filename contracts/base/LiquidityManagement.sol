// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import '@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3MintCallback.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';

import '../libraries/PoolAddress.sol';
import '../libraries/CallbackValidation.sol';
import '../libraries/LiquidityAmounts.sol';

import './PeripheryPayments.sol';
import './PeripheryImmutableState.sol';
import "hardhat/console.sol";
/// @title Liquidity management functions
/// @notice Internal functions for safely managing liquidity in Uniswap V3
abstract contract LiquidityManagement is IUniswapV3MintCallback, PeripheryImmutableState, PeripheryPayments {
    struct MintCallbackData {
        PoolAddress.PoolKey poolKey;
        address payer;
    }

    /// @inheritdoc IUniswapV3MintCallback
    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external override {
        console.log("mintcallback");
        MintCallbackData memory decoded = abi.decode(data, (MintCallbackData));
        console.log("mintcallback");
        CallbackValidation.verifyCallback(factory, decoded.poolKey);
        console.log("mintcallback");
        //console.log("amount0",amount0Owed);
        if (amount0Owed > 0) pay(decoded.poolKey.token0, decoded.payer, msg.sender, amount0Owed);
         console.log("mintcallback");
        if (amount1Owed > 0) pay(decoded.poolKey.token1, decoded.payer, msg.sender, amount1Owed);
         console.log("mintcallback");
    }

    struct AddLiquidityParams {
        address token0;
        address token1;
        uint24 fee;
        address recipient;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
    }

    /// @notice Add liquidity to an initialized pool
    function addLiquidity(AddLiquidityParams memory params)
        internal
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1,
            IUniswapV3Pool pool
        )
    {
        console.log("addLiquidity1");
        PoolAddress.PoolKey memory poolKey =
            PoolAddress.PoolKey({token0: params.token0, token1: params.token1, fee: params.fee});
        console.log("add Liquidity2 ");
        pool = IUniswapV3Pool(PoolAddress.computeAddress(factory, poolKey));
        console.log("add Liquidity3 ");
        // compute the liquidity amount
        {
           // console.log("add Liquidity4");
           
            (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
             //console.log("sqrtPrice",sqrtPriceX96);
            console.log("add Liquidity5");
            uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(params.tickLower);
            console.log("sqrtRatioAX96",sqrtRatioAX96);
            uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(params.tickUpper);
           console.log("sqrtRatioBX96",sqrtRatioBX96);

            liquidity = LiquidityAmounts.getLiquidityForAmounts(
                sqrtPriceX96,
                sqrtRatioAX96,
                sqrtRatioBX96,
                params.amount0Desired,
                params.amount1Desired
         );
        
        }
          //console.log("add Liquidity9");
        (amount0, amount1) = pool.mint(
            params.recipient,
            params.tickLower,
            params.tickUpper,
            liquidity,
            abi.encode(MintCallbackData({poolKey: poolKey, payer: msg.sender}))
        );
        //console.log("add Liquidity10");
        // console.log("amount0",amount0);
        // console.log("amount0Min",params.amount0Min);
        //  console.log("amount1",amount1);
        //  console.log("amount1Min",params.amount1Min);
        require(amount0 >= params.amount0Min && amount1 >= params.amount1Min, 'Here 1');
        console.log("add Liquidity11");
    }
}
