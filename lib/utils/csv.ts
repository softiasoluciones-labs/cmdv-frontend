/**
 * Convierte una lista de objetos en un CSV RFC 4180 y dispara la descarga.
 * Escapa comillas dobles y encapsula celdas con comas, saltos de línea o comillas.
 */

type CsvColumn<T> = {
    header: string;
    accessor: (row: T) => string | number | boolean | null | undefined;
};

function escapeCell(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
    const head = columns.map((c) => escapeCell(c.header)).join(",");
    const body = rows
        .map((row) => columns.map((c) => escapeCell(c.accessor(row))).join(","))
        .join("\r\n");
    // BOM para que Excel detecte UTF-8 correctamente.
    return `\uFEFF${head}\r\n${body}`;
}

export function downloadCsv(filename: string, content: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export type { CsvColumn };
