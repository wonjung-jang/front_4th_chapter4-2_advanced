import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./ScheduleContext.tsx";
import { ScheduleTables } from "./ScheduleTables.tsx";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleTables />
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
