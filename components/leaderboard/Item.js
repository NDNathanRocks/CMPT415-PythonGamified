import React from "react";

export default function Item({ row, index, isHeader }) {
  return (
    <li className="item">
        {isHeader ? <span className="item_header_rank">{row.rank}</span>:<span className="item__rank">{index+1}</span>}
        <span className="item__name">{row.name}</span>
        <span className="item__score">{row.score}</span>
        <span className="item__mcqsolved">{row.mcqsolved}</span>
        <span className="item__challsolved">{row.challsolved}</span>
        <span className="item__badges">{row.badges}</span>
    </li>
  );
}
