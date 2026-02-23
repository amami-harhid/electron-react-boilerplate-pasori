export interface NodemailerError extends Error {
  code?: string;
  response?: string;
  responseCode?: number;
  command?: string;
}