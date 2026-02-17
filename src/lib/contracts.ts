import MojoTokenABI from "../../abis/MojoToken.json";
import MojoSessionABI from "../../abis/MojoSession.json";
import MojoFighterABI from "../../abis/MojoFighter.json";

export const MOJO_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_MOJO_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const MOJO_SESSION_ADDRESS = (process.env.NEXT_PUBLIC_MOJO_SESSION_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const MOJO_FIGHTER_ADDRESS = (process.env.NEXT_PUBLIC_MOJO_FIGHTER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const mojoTokenConfig = {
  address: MOJO_TOKEN_ADDRESS,
  abi: MojoTokenABI,
} as const;

export const mojoSessionConfig = {
  address: MOJO_SESSION_ADDRESS,
  abi: MojoSessionABI,
} as const;

export const mojoFighterConfig = {
  address: MOJO_FIGHTER_ADDRESS,
  abi: MojoFighterABI,
} as const;
