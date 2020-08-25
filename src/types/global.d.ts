// This declaration says to TypeScript compiler that it's OK to import *.md files.
declare module '*.md' {
  const content: string;
  export default content;
}
