export async function call(): Promise<{ type: 'text'; value: string }> {
  return {
    type: 'text',
    value: 'Extra usage management is not available.',
  }
}
