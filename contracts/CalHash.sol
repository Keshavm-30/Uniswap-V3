pragma solidity >=0.5.16;
import './UniswapV3Pool.sol';

contract CalHash {
    function getInitHash() public pure returns(bytes32){
        bytes memory bytecode = type(UniswapV3Pool).creationCode;
        return keccak256(abi.encodePacked(bytecode));
    }
    
    
}
