import { useEffect, useState, useMemo, useRef } from "react";
import { parse } from "papaparse";
import { v4 } from "uuid";
import * as S from "./styles";

const createTable = (cols, rows, tableData) => {
  return (
    <>
      <h4>Tabela:</h4>
      <S.TableWrapper>
        <table>
          <thead>
            <tr>
              <th> - </th>
              {cols && cols.map((col) => <th key={v4()}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableData &&
              Object.values(tableData).map((row, index) => (
                <tr key={v4()}>
                  <td style={{ fontWeight: "bold" }}>{rows[index]}</td>
                  {Object.values(row).map((value) => (
                    <td key={v4()}>{value}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </S.TableWrapper>
    </>
  );
};

const CSVUploader = () => {
  const [cols, setCols] = useState(undefined);
  const [rows, setRows] = useState(undefined);
  const [tableData, setTableData] = useState(undefined);
  const [highLightedRow, setHighLightedRow] = useState(undefined);
  const [highLightedCol, setHighLightedCol] = useState(undefined);
  const [highLightedValue, setHighLightedValue] = useState(undefined);
  const RenderedTable = useMemo(
    () => createTable(cols, rows, tableData),
    [cols, rows, tableData]
  );
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (
      highLightedCol &&
      highLightedRow &&
      tableData[highLightedRow] &&
      tableData[highLightedRow][highLightedCol]
    ) {
      setHighLightedValue(tableData[highLightedRow][highLightedCol]);
    } else {
      setHighLightedValue(undefined);
    }
  }, [highLightedCol, highLightedRow, tableData]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: handleParsingComplete,
    });
  };

  const handleParsingComplete = (results) => {
    const data = results.data;

    const columnRefs = Object.keys(data[0]).slice(1);

    const rowRefs = data.map((row) => Number(row[Object.keys(row)[0]]));

    const parsedData = {};

    data.forEach((row) => {
      const rowRef = row[Object.keys(row)[0]];

      parsedData[rowRef] = {};

      columnRefs.forEach((columnRef) => {
        parsedData[rowRef][Number(columnRef)] = row[columnRef];
      });

      const rowData = parsedData;
      return { rowRef, rowData };
    });

    console.log(parsedData);

    setCols(columnRefs.map((value) => Number(value)));
    setRows(rowRefs);
    setTableData(parsedData);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(highLightedValue);
  };

  return (
    <S.Container>
      <h4>Dados:</h4>

      <S.InputContainer>
        <label>
          <span>Primeiro, insira a tabela (em formato CSV):</span>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button onClick={handleUploadClick}>Upload</button>
          </div>
        </label>
      </S.InputContainer>

      {tableData && (
        <>
          <S.HighLightContainer>
            <h4>Comandos:</h4>
            <p>
              Para coletar o valor em uma célula específica, entre com os
              valores de coluna/linha desejados:
            </p>

            <S.InputGroup>
              <label>
                <span>Linha/Excitação:</span>
                <input onChange={(e) => setHighLightedRow(e.target.value)} />
              </label>

              <label>
                <span>Coluna/Emissão:</span>
                <input onChange={(e) => setHighLightedCol(e.target.value)} />
              </label>
            </S.InputGroup>

            <S.HighLightResult>
              Valor associado:
              <span onClick={() => handleCopyClick()}>
                {highLightedValue || "-"}
              </span>
            </S.HighLightResult>
          </S.HighLightContainer>

          {RenderedTable}
        </>
      )}
    </S.Container>
  );
};

export default CSVUploader;
