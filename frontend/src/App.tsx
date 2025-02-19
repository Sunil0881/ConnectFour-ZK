import React, { useEffect, useState } from "react";

import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { abi } from "./ABI.json";
import { Spin, SpinGameInitArgs } from "spin";
import { config } from "./web3.tsx";
import { readContract } from "wagmi/actions";
import { TaskStatus } from "zkwasm-service-helper";


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/Home.tsx"
import PlayerVsPlayer from "./Components/PvP.tsx"
import PlayerVsCPU from "./Components/PlayerVsCPU.tsx"

const GAME_CONTRACT_ADDRESS = import.meta.env.VITE_GAME_CONTRACT_ADDRESS;
const ZK_USER_ADDRESS = import.meta.env.VITE_ZK_CLOUD_USER_ADDRESS;
const ZK_USER_PRIVATE_KEY = import.meta.env.VITE_ZK_CLOUD_USER_PRIVATE_KEY;
const ZK_IMAGE_MD5 = import.meta.env.VITE_ZK_CLOUD_IMAGE_MD5;
const ZK_CLOUD_RPC_URL = import.meta.env.VITE_ZK_CLOUD_URL;

interface GameState {
    total_steps: bigint;
    current_position: bigint;
}

/* This function is used to verify the proof on-chain */
async function verify_onchain({
    proof,
    verify_instance,
    aux,
    instances,
}: {
    proof: BigInt[];
    verify_instance: BigInt[];
    aux: BigInt[];
    instances: BigInt[];
    status: TaskStatus;
}) {
    console.log("proof", proof, verify_instance, aux, instances);
    const result = await writeContract(config, {
        abi,
        address: GAME_CONTRACT_ADDRESS,
        functionName: "settleProof",
        args: [proof, verify_instance, aux, [instances]],
    });
    const transactionReceipt = waitForTransactionReceipt(config, {
        hash: result,
    });
    return transactionReceipt;
}

/* This function is used to get the on-chain game states */
async function getOnchainGameStates() {
    const result = (await readContract(config, {
        abi,
        address: GAME_CONTRACT_ADDRESS,
        functionName: "getStates",
        args: [],
    })) as [bigint, bigint];
    return result;
}

let spin: Spin;

function App() {
    useEffect(() => {
        getOnchainGameStates().then(async (result): Promise<any> => {
            const total_steps = result[0];
            const current_position = result[1];

            console.log("total_steps = ", total_steps);
            console.log("current_position = ", current_position);
            setOnChainGameStates({
                total_steps,
                current_position,
            });

            spin = new Spin({
                cloudCredentials: {
                    CLOUD_RPC_URL: ZK_CLOUD_RPC_URL,
                    USER_ADDRESS: ZK_USER_ADDRESS,
                    USER_PRIVATE_KEY: ZK_USER_PRIVATE_KEY,
                    IMAGE_HASH: ZK_IMAGE_MD5,
                },
            });
            spin.initialize_import().then(() => {
                const arg = new SpinGameInitArgs(total_steps, current_position);
                console.log("arg = ", arg);
                spin.initialize_game(arg);
                updateDisplay();
            });
        });
    }, []);

    const [gameState, setGameState] = useState<GameState>({
        total_steps: BigInt(0),
        current_position: BigInt(0),
    });

    const [onChainGameStates, setOnChainGameStates] = useState<GameState>({
        total_steps: BigInt(0),
        current_position: BigInt(0),
    });

    const [moves, setMoves] = useState<bigint[]>([]);

    const onClick = (command: bigint) => () => {
        spin.step(command);
        updateDisplay();
    };

    const updateDisplay = () => {
        const newGameState = spin.getGameState();
        setGameState({
            total_steps: newGameState.total_steps,
            current_position: newGameState.current_position,
        });
        setMoves(spin.witness);
    };

    // Submit the proof to the cloud
    const submitProof = async () => {
        const proof = await spin.generateProof();

        if (!proof) {
            console.error("Proof generation failed");
            return;
        }
        // onchain verification operations
        console.log("submitting proof");
        const verificationResult = await verify_onchain(proof);

        console.log("verificationResult = ", verificationResult);

        // wait for the transaction to be broadcasted, better way is to use event listener
        await new Promise((r) => setTimeout(r, 1000));

        const gameStates = await getOnchainGameStates();

        setOnChainGameStates({
            total_steps: gameStates[0],
            current_position: gameStates[1],
        });

        await spin.reset();
        // awonGameInitReady(gameStates[0], gameStates[1]);
    };

    

    return (
        <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player-vs-player" element={<PlayerVsPlayer />} />
          <Route path="/player-vs-cpu" element={<PlayerVsCPU />} />
        </Routes>
      </Router>
       
    );
}

export default App;
