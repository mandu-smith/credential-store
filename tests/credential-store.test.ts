import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const admin = accounts.get("wallet_1")!;
const newAdmin = accounts.get("wallet_4")!;
const artist = accounts.get("wallet_2")!;
const producer = accounts.get("wallet_3")!;
const outsider = accounts.get("wallet_5")!;

describe("Music Royalty Distribution Contract Tests", () => {
  it("simnet should be initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should register a new song successfully", () => {
    const songTitle = "My First Hit Song";
    const tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "register-new-song",
      functionArgs: [songTitle, artist],
      sender: admin,
    });

    expect(tx.result.ok).toBeUint(1); // first song id
  });

  it("should retrieve total registered songs", () => {
    const result = simnet.callReadOnlyFn(
      "music-royalty",
      "get-total-registered-songs",
      [],
      admin
    );

    expect(result).toBeUint(1);
  });

  it("should set royalty distribution for the song", () => {
    // Set 70% to artist
    let tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "set-royalty-distribution",
      functionArgs: [1, artist, 70, "Primary Artist"],
      sender: admin,
    });
    expect(tx.result.ok).toBeTruthy();

    // Set 30% to producer
    tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "set-royalty-distribution",
      functionArgs: [1, producer, 30, "Producer"],
      sender: admin,
    });
    expect(tx.result.ok).toBeTruthy();
  });

  it("should fail when total royalty exceeds 100%", () => {
    const tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "set-royalty-distribution",
      functionArgs: [1, outsider, 10, "Guest Artist"], // 70+30+10=110%
      sender: admin,
    });
    expect(tx.result.err).toBeDefined();
  });

  it("should fail when non-admin tries to register a song", () => {
    const tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "register-new-song",
      functionArgs: ["Unauthorized Song", outsider],
      sender: outsider,
    });
    expect(tx.result.err).toBeDefined();
  });

  it("should process royalty payment successfully", () => {
    const paymentAmount = 1000; // example STX amount
    const tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "process-royalty-payment",
      functionArgs: [1, paymentAmount],
      sender: admin,
    });

    expect(tx.result.ok).toBeTruthy();
  });

  it("should fail to process royalty payment with insufficient funds", () => {
    const hugePayment = 10_000_000; // assuming admin balance is lower than this
    const tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "process-royalty-payment",
      functionArgs: [1, hugePayment],
      sender: admin,
    });

    expect(tx.result.err).toBeDefined();
  });

  it("should correctly update accumulated earnings for each royalty recipient", () => {
    const paymentAmount = 1000;

    // Check artist earnings (70%)
    const artistResult = simnet.callReadOnlyFn(
      "music-royalty",
      "get-royalty-distribution",
      [1, artist],
      admin
    );
    expect(artistResult).toBeDefined();
    const expectedArtistEarnings = Math.floor((paymentAmount * 70) / 100);
    expect(artistResult.accumulated-earnings).toBeUint(expectedArtistEarnings);

    // Check producer earnings (30%)
    const producerResult = simnet.callReadOnlyFn(
      "music-royalty",
      "get-royalty-distribution",
      [1, producer],
      admin
    );
    expect(producerResult).toBeDefined();
    const expectedProducerEarnings = Math.floor((paymentAmount * 30) / 100);
    expect(producerResult.accumulated-earnings).toBeUint(expectedProducerEarnings);
  });

  it("should transfer admin rights and enforce permissions", () => {
    // Transfer to new admin
    let tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "transfer-administrator-rights",
      functionArgs: [newAdmin],
      sender: admin,
    });
    expect(tx.result.ok).toBeTruthy();

    // Old admin cannot register a new song anymore
    tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "register-new-song",
      functionArgs: ["Old Admin Song", artist],
      sender: admin,
    });
    expect(tx.result.err).toBeDefined();

    // New admin can register a new song
    tx = simnet.deployAndCall({
      contract: "music-royalty",
      functionName: "register-new-song",
      functionArgs: ["New Admin Song", artist],
      sender: newAdmin,
    });
    expect(tx.result.ok).toBeUint(2); // second song
  });
});
