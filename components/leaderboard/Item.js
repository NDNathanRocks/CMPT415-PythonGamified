import React from "react";

export default function Item({ row }) {
  return (
    <li className="item">
        <span className="item__rank">{row.rank}</span>
        <span className="item__name">{row.name}</span>
        <span className="item__score">{row.score}</span>
        <span className="item__mcqsolved">{row.mcqsolved}</span>
        <span className="item__challsolved">{row.challsolved}</span>
    </li>
  );
}
