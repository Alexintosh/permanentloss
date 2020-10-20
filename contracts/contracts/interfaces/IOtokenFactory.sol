// SPDX-License-Identifier: MIT
// !! THIS FILE WAS AUTOGENERATED BY abi-to-sol. SEE BELOW FOR SOURCE. !!
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

interface IOtokenFactory {
    event OtokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        address underlying,
        address strike,
        address collateral,
        uint256 strikePrice,
        uint256 expiry,
        bool isPut
    );

    function addressBook() external view returns (address);

    function createOtoken(
        address _underlyingAsset,
        address _strikeAsset,
        address _collateralAsset,
        uint256 _strikePrice,
        uint256 _expiry,
        bool _isPut
    ) external returns (address);

    function getOtoken(
        address _underlyingAsset,
        address _strikeAsset,
        address _collateralAsset,
        uint256 _strikePrice,
        uint256 _expiry,
        bool _isPut
    ) external view returns (address);

    function getOtokensLength() external view returns (uint256);

    function getTargetOtokenAddress(
        address _underlyingAsset,
        address _strikeAsset,
        address _collateralAsset,
        uint256 _strikePrice,
        uint256 _expiry,
        bool _isPut
    ) external view returns (address);

    function otokens(uint256) external view returns (address);
}