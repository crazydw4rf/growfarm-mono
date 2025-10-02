import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export function McpOk(text: string): ReturnType<ToolCallback> {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

export function McpError(err: any): ReturnType<ToolCallback> {
  let error: Error;

  if (!(err instanceof Error)) {
    error = new Error(`Unknown error: ${String(err)}`);
  } else {
    error = err;
  }

  return {
    content: [
      {
        type: "text",
        text: `Terdapat kesalahan ketika memproses permintaan: cause: ${error.cause as string}, message: ${error.message}`,
      },
    ],
  };
}

export function formatResponse(o: Record<string, any> | any[]): string {
  if (Array.isArray(o)) {
    return o
      .map((item, index) => {
        if (typeof item === "object" && item !== null) {
          const formatted = Object.entries(item as Record<string, any>)
            .filter(([key]) => !key.toLowerCase().includes("id"))
            .map(([key, value]) => {
              if (value instanceof Date) {
                return `${key}:${value.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                })}`;
              }
              return `${key}:${String(value)}`;
            })
            .join(",");
          return `Item${index + 1}:${formatted}`;
        }
        return `Item${index + 1}:${String(item)}`;
      })
      .join("|");
  }

  return Object.entries(o)
    .filter(([key]) => !key.toLowerCase().includes("id"))
    .map(([key, value]) => {
      if (value instanceof Date) {
        return `${key}: ${value.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
        })}`;
      }
      if (Array.isArray(value) && value.length >= 1) {
        const formattedItems = value
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return Object.entries(item as Record<string, any>)
                .filter(([itemKey]) => !itemKey.toLowerCase().includes("id"))
                .map(([itemKey, itemValue]) => {
                  if (itemValue instanceof Date) {
                    return `${itemKey}: ${itemValue.toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                    })}`;
                  }
                  return `${itemKey}:${String(itemValue)}`;
                })
                .join(",");
            }
            return String(item);
          })
          .join("|");

        return `${key}:[${formattedItems}]`;
      }
      return `${key}:${value}`;
    })
    .join("|");
}
