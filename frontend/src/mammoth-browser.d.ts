// mammoth ships a prebuilt browser bundle without its own type declarations.
// Reuse the main package's types for the browser subpath import.
declare module 'mammoth/mammoth.browser' {
  import mammoth from 'mammoth';
  export = mammoth;
}
