"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type TTT = { id: string; state: { board: string[]; xIsNext: boolean }; status: string };

export default function GamesPage() {
  const supabase = createSupabaseClient();
  const [match, setMatch] = useState<TTT | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("ttt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games_tictactoe_matches" }, (payload) => {
        setMatch(payload.new as any);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const createMatch = async () => {
    const { data } = await supabase.from("games_tictactoe_matches").insert({}).select().single();
    setMatch(data as any);
  };

  const play = async (idx: number) => {
    if (!match) return;
    const board = [...match.state.board];
    if (board[idx]) return;
    board[idx] = match.state.xIsNext ? "X" : "O";
    const xIsNext = !match.state.xIsNext;
    await supabase.from("games_tictactoe_matches").update({ state: { board, xIsNext } }).eq("id", match.id);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Games</h1>
      {!match && (
        <button onClick={createMatch} className="bg-black text-white rounded px-4 py-2">Start TicTacToe</button>
      )}
      {match && (
        <div className="grid grid-cols-3 gap-2 w-48">
          {match.state.board.map((v, i) => (
            <button key={i} onClick={() => play(i)} className="border h-16 text-2xl">
              {v}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-gray-600">Free users see ads when starting/searching games.</p>
    </div>
  );
}
