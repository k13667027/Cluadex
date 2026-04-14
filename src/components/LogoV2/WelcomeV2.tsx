import React from 'react';
import { Box, Text, useTheme } from 'src/ink.js';
import { env } from '../../utils/env.js';

declare const MACRO: { VERSION: string; DISPLAY_VERSION?: string }

const WELCOME_V2_WIDTH = 58;

export function WelcomeV2() {
  const [theme] = useTheme();
  
  if (env.terminal === "Apple_Terminal") {
    return (
      <AppleTerminalWelcomeV2 
        theme={theme} 
        welcomeMessage="Welcome to Cluadex" 
      />
    );
  }
  
  return (
    <Box width={WELCOME_V2_WIDTH}>
      <Text>
        <Text color="claude">{"Welcome to Cluadex"} </Text>
        <Text dimColor={true}>v{MACRO.DISPLAY_VERSION ?? MACRO.VERSION} </Text>
      </Text>
    </Box>
  );
}

type AppleTerminalWelcomeV2Props = {
  theme: string;
  welcomeMessage: string;
};

function AppleTerminalWelcomeV2({ theme, welcomeMessage }: AppleTerminalWelcomeV2Props) {
  return (
    <Box width={WELCOME_V2_WIDTH}>
      <Text>
        <Text color="claude">{welcomeMessage} </Text>
        <Text dimColor={true}>v{MACRO.DISPLAY_VERSION ?? MACRO.VERSION} </Text>
      </Text>
    </Box>
  );
}
