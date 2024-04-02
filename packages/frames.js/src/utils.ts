import type { CastId } from "./farcaster";
import { Message, MessageType, Protocol } from "./farcaster";
import type {
  FrameActionPayload,
  FrameButton,
  FrameButtonLink,
  FrameButtonMint,
  FrameButtonTx,
} from "./types";

export function isFrameButtonLink(
  frameButton: FrameButton
): frameButton is FrameButtonLink {
  return frameButton.action === "link";
}

export function isFrameButtonTx(
  frameButton: FrameButton
): frameButton is FrameButtonTx {
  return frameButton.action === "tx";
}

export function isFrameButtonMint(
  frameButton: FrameButton
): frameButton is FrameButtonMint {
  return frameButton.action === "mint";
}

export function bytesToHexString(bytes: Uint8Array): `0x${string}` {
  return `0x${Buffer.from(bytes).toString("hex")}`;
}

export function getByteLength(str: string): number {
  return Buffer.from(str).byteLength;
}

export function hexStringToUint8Array(hexstring: string): Uint8Array {
  const matches = hexstring.match(/.{1,2}/g);

  if (!matches) {
    throw new Error("Invalid hex string provided");
  }

  return new Uint8Array(matches.map((byte: string) => parseInt(byte, 16)));
}

export function normalizeCastId(castId: CastId): {
  fid: number;
  hash: `0x${string}`;
} {
  return {
    fid: castId.fid,
    hash: bytesToHexString(castId.hash),
  };
}

/**
 * Extracts a Farcaster Message from the trustedData bytes in the `POST` body payload
 */
export function getFrameMessageFromRequestBody(
  body: FrameActionPayload
): Message {
  return Message.decode(Buffer.from(body.trustedData.messageBytes, "hex"));
}

/**
 * Validates whether the version param is valid
 * @param version - the version string to validate
 * @returns true if the provided version conforms to the Frames spec
 */
export function isValidVersion(version: string): boolean {
  // Check if the input is exactly 'vNext'
  if (version === "vNext") {
    return true;
  }

  // Regular expression to match the pattern YYYY-MM-DD
  // ^ asserts position at start of the string
  // \d{4} matches exactly four digits (for the year)
  // - matches the literal "-"
  // \d{2} matches exactly two digits (for the month)
  // - matches the literal "-"
  // \d{2} matches exactly two digits (for the day)
  // $ asserts position at the end of the string
  const pattern = /^\d{4}-\d{2}-\d{2}$/;

  // Test the input against the pattern
  if (!pattern.test(version)) {
    return false;
  }

  return true;
}

export function getEnumKeyByEnumValue<
  TEnumKey extends string,
  TEnumVal extends string | number,
>(
  enumDefinition: { [key in TEnumKey]: TEnumVal },
  enumValue: TEnumVal
): string {
  return (
    Object.keys(enumDefinition)[
      Object.values(enumDefinition).indexOf(enumValue)
    ] ?? ""
  );
}

export function extractAddressFromJSONMessage(
  message: unknown
): `0x${string}` | null {
  const { data } = Message.fromJSON(message);

  if (!data) {
    throw new Error("Invalid message provided. Message data is missing");
  }

  if (data.type !== MessageType.VERIFICATION_ADD_ETH_ADDRESS) {
    throw new Error(
      `Invalid message provided. Expected message type to be ${MessageType.VERIFICATION_ADD_ETH_ADDRESS} but got ${getEnumKeyByEnumValue(MessageType, data.type)}.`
    );
  }

  if (!data.verificationAddAddressBody) {
    throw new Error(
      "Invalid message provided. Message data is missing verificationAddAddressBody"
    );
  }

  if (data.verificationAddAddressBody.protocol !== Protocol.ETHEREUM) {
    return null;
  }

  return bytesToHexString(data.verificationAddAddressBody.address);
}
