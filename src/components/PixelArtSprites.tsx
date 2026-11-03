import React from 'react';
import { CupStyle, CustomDrink, DecorationSlot } from '../types';

interface DrinkSpriteProps {
  drink: Pick<
    CustomDrink,
    'cupStyle' | 'liquidColor' | 'secondaryColor' | 'temperature' | 'topping'
  >;
  size?: number;
  animateSteam?: boolean;
}

export const PixelDrinkSprite: React.FC<DrinkSpriteProps> = ({
  drink,
  size = 64,
  animateSteam = true,
}) => {
  const { cupStyle, liquidColor, secondaryColor, temperature, topping } = drink;

  const renderTopping = (topY: number) => {
    switch (topping) {
      case 'Foam Krim':
        return (
          <g>
            <rect x="5" y={topY} width="6" height="2" fill="#FFFDF9" />
            <rect x="6" y={topY - 1} width="4" height="1" fill="#F5E6D3" />
          </g>
        );
      case 'Boba Hitam':
        return (
          <g>
            <rect x="6" y="12" width="1" height="1" fill="#22130C" />
            <rect x="8" y="13" width="1" height="1" fill="#22130C" />
            <rect x="9" y="11" width="1" height="1" fill="#22130C" />
            <rect x="7" y="13" width="1" height="1" fill="#3A2116" />
          </g>
        );
      case 'Daun Mint':
        return (
          <g>
            <rect x="8" y={topY - 1} width="2" height="1" fill="#46A758" />
            <rect x="9" y={topY - 2} width="2" height="1" fill="#65C476" />
          </g>
        );
      case 'Kayu Manis':
        return (
          <g>
            <rect x="9" y={topY - 2} width="1" height="3" fill="#8C4A27" />
            <rect x="6" y={topY} width="3" height="1" fill="#B6683B" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderCup = (style: CupStyle) => {
    switch (style) {
      case 'mug':
        return (
          <g>
            {/* Mug Outline & Body */}
            <rect x="4" y="6" width="8" height="8" fill="#E8DCCB" />
            <rect x="5" y="14" width="6" height="1" fill="#C9B8A3" />
            {/* Handle */}
            <rect x="12" y="7" width="2" height="1" fill="#E8DCCB" />
            <rect x="13" y="8" width="1" height="3" fill="#E8DCCB" />
            <rect x="12" y="11" width="2" height="1" fill="#C9B8A3" />
            {/* Liquid inside */}
            <rect x="5" y="7" width="6" height="6" fill={liquidColor} />
            <rect x="5" y="7" width="6" height="2" fill={secondaryColor} opacity="0.85" />
            {renderTopping(6)}
          </g>
        );
      case 'tallGlass':
        return (
          <g>
            {/* Glass Rim & Walls */}
            <rect x="5" y="4" width="6" height="11" fill="#DCEEF2" opacity="0.45" />
            <rect x="5" y="5" width="6" height="9" fill={liquidColor} />
            <rect x="5" y="10" width="6" height="4" fill={secondaryColor} opacity="0.85" />
            {/* Straw */}
            <rect x="9" y="2" width="1" height="4" fill="#D97736" />
            {/* Ice cubes if cold */}
            {temperature === 'Dingin' && (
              <g>
                <rect x="6" y="7" width="2" height="2" fill="#FFFFFF" opacity="0.7" />
                <rect x="8" y="9" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
              </g>
            )}
            {renderTopping(5)}
          </g>
        );
      case 'teacup':
        return (
          <g>
            {/* Saucer */}
            <rect x="3" y="13" width="10" height="1" fill="#E8DCCB" />
            <rect x="4" y="14" width="8" height="1" fill="#BFA992" />
            {/* Cup */}
            <rect x="4" y="8" width="8" height="4" fill="#F4ECE1" />
            <rect x="5" y="12" width="6" height="1" fill="#D6C4B0" />
            <rect x="12" y="9" width="1" height="2" fill="#E8DCCB" />
            {/* Tea Liquid */}
            <rect x="5" y="8" width="6" height="3" fill={liquidColor} />
            {renderTopping(8)}
          </g>
        );
      case 'boba':
        return (
          <g>
            {/* Wide Straw */}
            <rect x="7" y="1" width="2" height="5" fill="#3B2820" />
            {/* Dome Lid */}
            <rect x="5" y="4" width="6" height="1" fill="#E6F2F5" opacity="0.7" />
            <rect x="4" y="5" width="8" height="1" fill="#E6F2F5" opacity="0.85" />
            {/* Cup Body */}
            <rect x="5" y="6" width="6" height="9" fill={liquidColor} />
            <rect x="5" y="11" width="6" height="4" fill={secondaryColor} opacity="0.85" />
            {/* Boba Pearls */}
            <rect x="6" y="13" width="1" height="1" fill="#1E110B" />
            <rect x="8" y="13" width="1" height="1" fill="#1E110B" />
            <rect x="9" y="12" width="1" height="1" fill="#1E110B" />
            {renderTopping(6)}
          </g>
        );
      case 'pourover':
        return (
          <g>
            {/* Wood Collar */}
            <rect x="6" y="8" width="4" height="2" fill="#A46336" />
            {/* Upper Cone */}
            <rect x="4" y="5" width="8" height="2" fill="#DCEEF2" opacity="0.6" />
            <rect x="5" y="7" width="6" height="1" fill="#DCEEF2" opacity="0.6" />
            {/* Lower Carafe */}
            <rect x="5" y="10" width="6" height="2" fill="#DCEEF2" opacity="0.45" />
            <rect x="4" y="11" width="8" height="4" fill={liquidColor} />
            <rect x="5" y="12" width="2" height="1" fill={secondaryColor} opacity="0.65" />
            {renderTopping(5)}
          </g>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className="pixel-art shrink-0"
      aria-hidden="true"
    >
      {/* Steam for hot drinks */}
      {temperature === 'Panas' && (
        <g>
          <g className={animateSteam ? 'animate-steam-1' : ''}>
            <rect x="6" y="2" width="1" height="2" fill="#F5EBE1" opacity="0.65" />
            <rect x="7" y="1" width="1" height="1" fill="#F5EBE1" opacity="0.45" />
          </g>
          <g className={animateSteam ? 'animate-steam-2' : ''}>
            <rect x="9" y="3" width="1" height="2" fill="#F5EBE1" opacity="0.6" />
            <rect x="10" y="2" width="1" height="1" fill="#F5EBE1" opacity="0.4" />
          </g>
        </g>
      )}
      {renderCup(cupStyle)}
    </svg>
  );
};

export const PixelCoinSprite: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    shapeRendering="crispEdges"
    className="pixel-art shrink-0"
    aria-hidden="true"
  >
    <rect x="3" y="1" width="6" height="10" fill="#F4B43A" />
    <rect x="2" y="2" width="8" height="8" fill="#F4B43A" />
    <rect x="1" y="3" width="10" height="6" fill="#F4B43A" />
    <rect x="3" y="2" width="5" height="1" fill="#FFE38E" />
    <rect x="2" y="3" width="1" height="5" fill="#FFE38E" />
    <rect x="5" y="4" width="2" height="4" fill="#B87614" />
  </svg>
);

export const PixelDecorationSprite: React.FC<{
  slot: DecorationSlot;
  size?: number;
}> = ({ slot, size = 56 }) => {
  switch (slot) {
    case 'cat':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          {/* Cushion */}
          <rect x="2" y="11" width="12" height="3" fill="#9E3F33" />
          <rect x="3" y="10" width="10" height="2" fill="#C45647" />
          {/* Sleeping Calico Cat */}
          <rect x="4" y="7" width="8" height="4" fill="#F6EADF" />
          <rect x="4" y="6" width="2" height="2" fill="#E08A3C" />
          <rect x="8" y="6" width="2" height="2" fill="#2E221D" />
          <rect x="9" y="7" width="3" height="2" fill="#E08A3C" />
          {/* Closed sleepy eye & tail */}
          <rect x="5" y="9" width="2" height="1" fill="#2E221D" />
          <rect x="11" y="9" width="2" height="2" fill="#2E221D" />
        </svg>
      );
    case 'lights':
      return (
        <svg width={size * 1.6} height={size * 0.75} viewBox="0 0 24 12" shapeRendering="crispEdges" className="pixel-art">
          <rect x="1" y="2" width="22" height="1" fill="#3D2B22" />
          {[3, 8, 13, 19].map((x, idx) => (
            <g key={x}>
              <rect x={x} y="3" width="1" height={idx % 2 === 0 ? 2 : 3} fill="#5C4438" />
              <rect x={x - 1} y={idx % 2 === 0 ? 5 : 6} width="3" height="3" fill="#FFD97D" />
              <rect x={x} y={idx % 2 === 0 ? 6 : 7} width="1" height="1" fill="#FFFDF5" />
            </g>
          ))}
        </svg>
      );
    case 'vinyl':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          {/* Wooden Turntable Box */}
          <rect x="2" y="9" width="12" height="5" fill="#7D482A" />
          <rect x="2" y="7" width="12" height="2" fill="#A4633B" />
          {/* Vinyl Disc */}
          <rect x="4" y="5" width="7" height="3" fill="#1F1917" />
          <rect x="6" y="6" width="3" height="1" fill="#E08A3C" />
          {/* Tonearm */}
          <rect x="11" y="4" width="2" height="4" fill="#D9CABB" />
        </svg>
      );
    case 'plant':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          {/* Terracotta Pot */}
          <rect x="5" y="10" width="6" height="5" fill="#BA5B38" />
          <rect x="4" y="9" width="8" height="2" fill="#D46F4A" />
          {/* Monstera Leaves */}
          <rect x="7" y="5" width="2" height="4" fill="#3E824D" />
          <rect x="3" y="4" width="4" height="3" fill="#4FA361" />
          <rect x="9" y="3" width="4" height="4" fill="#63BD76" />
          <rect x="5" y="2" width="4" height="3" fill="#4FA361" />
        </svg>
      );
    case 'aquarium':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          <rect x="2" y="5" width="12" height="8" fill="#3E7FA6" opacity="0.82" />
          <rect x="2" y="4" width="12" height="1" fill="#5A3E2E" />
          <rect x="2" y="13" width="12" height="2" fill="#C9A87C" />
          {/* Goldfish */}
          <rect x="7" y="8" width="3" height="2" fill="#F28530" />
          <rect x="6" y="9" width="1" height="1" fill="#FFB366" />
          {/* Seaweed & Bubbles */}
          <rect x="4" y="9" width="1" height="4" fill="#499E60" />
          <rect x="11" y="6" width="1" height="1" fill="#DDF4FF" />
        </svg>
      );
    case 'neonSign':
      return (
        <svg width={size * 1.2} height={size * 0.9} viewBox="0 0 20 14" shapeRendering="crispEdges" className="pixel-art">
          <rect x="1" y="2" width="18" height="10" fill="#1F1510" />
          <rect x="2" y="3" width="16" height="8" fill="#2D1E17" />
          {/* Glowing pixel mug/heart motif */}
          <rect x="5" y="5" width="4" height="4" fill="#FFB85C" />
          <rect x="11" y="5" width="4" height="1" fill="#FF8C61" />
          <rect x="11" y="7" width="3" height="1" fill="#FF8C61" />
          <rect x="11" y="9" width="4" height="1" fill="#FF8C61" />
        </svg>
      );
    case 'espressoGold':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          <rect x="3" y="4" width="10" height="10" fill="#D69B38" />
          <rect x="4" y="3" width="8" height="1" fill="#F5CB6E" />
          <rect x="5" y="7" width="6" height="5" fill="#36241B" />
          <rect x="7" y="8" width="2" height="2" fill="#E08A3C" />
          <rect x="6" y="10" width="4" height="2" fill="#F5EBE1" />
        </svg>
      );
    case 'pastryCase':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
          <rect x="2" y="6" width="12" height="6" fill="#DCEEF2" opacity="0.55" />
          <rect x="2" y="12" width="12" height="3" fill="#6E4228" />
          {/* Croissants */}
          <rect x="4" y="9" width="3" height="2" fill="#DF8F3B" />
          <rect x="9" y="9" width="3" height="2" fill="#C97328" />
          <rect x="6" y="7" width="4" height="1" fill="#F2B463" />
        </svg>
      );
  }
};
