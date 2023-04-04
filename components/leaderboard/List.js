import React from "react";
import Item from "./Item";

export default function List({ data, isHeader }) {
  return (
    <ul className="item-wrapper">
      {data.map((row, index) => (
        <Item row={row} key={row.userID} index={index} isHeader={isHeader} />
      ))}
    </ul>
  );
}
