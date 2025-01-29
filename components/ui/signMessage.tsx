"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Keypair } from "@solana/web3.js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SignMessage = () => {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("Hello world!"); // Default message
  const [keyType, setKeyType] = useState("base58"); // Default to Base58
  const [signature, setSignature] = useState<{
    message: {
      message: string;
      publicKey: string;
      timestamp: number;
    };
    signature: {
      data: number[];
      type: string;
    };
    wallet: string;
  } | null>(null);

  const handleSignMessage = () => {
    try {
      if (!privateKey.trim()) {
        throw new Error("Private key is required.");
      }

      let privateKeyArray;

      if (keyType === "base58") {
        // Decode Base58 private key from Phantom or other wallets
        privateKeyArray = bs58.decode(privateKey);
      } else {
        // Parse Uint8Array from comma-separated string
        privateKeyArray = Uint8Array.from(
          privateKey.split(",").map((num) => parseInt(num.trim()))
        );
      }

      if (privateKeyArray.length !== 64) {
        throw new Error("Invalid private key length. Expected 64 bytes.");
      }

      // Construct the message object
      const messageObject = {
        message: message || "Hello world!",
        publicKey: publicKey,
        timestamp: Date.now(),
      };

      // Convert message to JSON string
      const messageString = JSON.stringify(messageObject);

      // Create keypair and sign the message
      const keypair = Keypair.fromSecretKey(privateKeyArray);
      const encodedMessage = new TextEncoder().encode(messageString);
      const signatureBytes = nacl.sign.detached(
        encodedMessage,
        keypair.secretKey
      );

      const result = {
        message: messageObject,
        signature: {
          data: Array.from(signatureBytes),
          type: "Buffer",
        },
        wallet: publicKey,
      };

      // Update the state with the generated signature
      setSignature(result);
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Failed to sign message. Please check your inputs.");
    }
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Sign Message with Solana Keypair</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Public Key Input */}
            <div>
              <Label htmlFor="publicKey">Public Key</Label>
              <Input
                id="publicKey"
                type="text"
                placeholder="Enter your public key"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
              />
            </div>

            {/* Private Key Type Selector */}
            <div>
              <Label htmlFor="keyType">Private Key Type</Label>
              <RadioGroup
                defaultValue="base58"
                onValueChange={(value) => setKeyType(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="base58" id="base58" />
                  <Label htmlFor="base58">
                    Base58 (Phantom, Solflare, etc.)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uint8array" id="uint8array" />
                  <Label htmlFor="uint8array">Comma-Separated Uint8Array</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Private Key Input */}
            <div>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="text"
                placeholder={
                  keyType === "base58"
                    ? "Enter your Base58 private key"
                    : "Enter comma-separated Uint8Array"
                }
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
            </div>

            {/* Message Input */}
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Sign Button */}
            <Button onClick={handleSignMessage}>Sign Message</Button>

            {/* Display Signature */}
            {signature && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Signed Message</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(signature, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignMessage;
