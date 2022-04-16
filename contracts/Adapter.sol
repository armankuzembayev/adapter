//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Router.sol";


contract Adapter {
    event Pair(address indexed pair);
    event AddLiquidity(uint256 amountA, uint256 amountB, uint256 liquidity);
    event RemoveLiquidity(uint256 amountA, uint256 amountB);
    event Swap(uint256 amountOut);

    address constant public FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address constant public ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function getPair(address _tokenA, address _tokenB) public view returns(address) {
        return IUniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB);
    }

    function createPair(address _tokenA, address _tokenB) public {
        require(_tokenA != address(0) &&  _tokenB != address(0), "Zero address provided");

        address pair = getPair(_tokenA, _tokenB);
        if (pair == address(0)) {
            pair = IUniswapV2Factory(FACTORY).createPair(_tokenA, _tokenB);
        }

        emit Pair(pair);
    }

    function addLiquidity(
        address _tokenA, address _tokenB, 
        uint256 _amountA, uint256 _amountB, 
        uint _amountAMin, uint _amountBMin,
        address _to) public {

        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
        IERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);

        IERC20(_tokenA).approve(ROUTER, _amountA);
        IERC20(_tokenB).approve(ROUTER, _amountB);

        uint256 deadline = block.timestamp + 100;

        (uint amountA, uint amountB, uint liquidity) = IUniswapV2Router(ROUTER).addLiquidity(
            _tokenA, _tokenB, 
            _amountA, _amountB, 
            _amountAMin, _amountBMin,
             _to, deadline
        );
        
        emit AddLiquidity(amountA, amountB, liquidity);
    }

    function addLiquidityETH(
        address _token, 
        uint256 _amountToken,
        uint _amountTokenMin, uint _amountETHMin,
        address _to) public payable {

        IERC20(_token).transferFrom(msg.sender, address(this), _amountToken);

        IERC20(_token).approve(ROUTER, _amountToken);

        uint256 deadline = block.timestamp + 100;

        (uint amountToken, uint amountETH, uint liquidity) = IUniswapV2Router(ROUTER).
        addLiquidityETH{value: msg.value}(
            _token, _amountToken, 
            _amountTokenMin, _amountETHMin,
             _to, deadline
        );
        
        emit AddLiquidity(amountToken, amountETH, liquidity);
    }

    function removeLiquidity(
        address _tokenA, address _tokenB, 
        uint256 _liquidity,
        uint256 _amountAMin, uint256 _amountBMin,
        address _to) public {
        
        address pair = getPair(_tokenA, _tokenB);
        IERC20(pair).transferFrom(msg.sender, address(this), _liquidity);
        IERC20(pair).approve(ROUTER, _liquidity);

        uint256 deadline = block.timestamp + 100;
        (uint amountA, uint amountB) = IUniswapV2Router(ROUTER).removeLiquidity(
            _tokenA, _tokenB, 
            _liquidity, 
            _amountAMin, _amountBMin, 
            _to, deadline
        );

        emit RemoveLiquidity(amountA, amountB);
    }

    function removeLiquidityETH(
        address _token, 
        uint256 _liquidity,
        uint256 _amountTokenMin, uint256 _amountETHMin,
        address _to) public {

        address pair = getPair(_token, WETH);
        IERC20(pair).transferFrom(msg.sender, address(this), _liquidity);
        IERC20(pair).approve(ROUTER, _liquidity);

        uint256 deadline = block.timestamp + 100;
        (uint amountToken, uint amountETH) = IUniswapV2Router(ROUTER).removeLiquidityETH(
            _token, _liquidity, 
            _amountTokenMin, _amountETHMin, 
            _to, deadline
        );

        emit RemoveLiquidity(amountToken, amountETH);
    }

    function getPairBalance(address _tokenA, address _tokenB) public view returns(uint) {
        address pair = getPair(_tokenA, _tokenB);
        return IERC20(pair).balanceOf(msg.sender);
    }

    function getAmountsOut(uint256 _amountIn, address[] calldata _path) public view returns(uint) {
        uint256[] memory amounts = IUniswapV2Router(ROUTER).getAmountsOut(_amountIn, _path);

        return amounts[amounts.length - 1];
    }

    function swap(uint256 _amountIn, uint256 _amountOutMin, address[] calldata _path, address _to) public {
        
        IERC20(_path[0]).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_path[0]).approve(ROUTER, _amountIn);

        uint256 deadline = block.timestamp + 1000;

        uint256[] memory amounts = IUniswapV2Router(ROUTER).swapExactTokensForTokens(_amountIn, _amountOutMin, _path, _to, deadline);
        
        emit Swap(amounts[amounts.length - 1]);
    }

}