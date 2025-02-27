import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useMemo, useState } from "react";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = useMemo(
    () => Object.keys(schedulesMap).length === 1,
    [schedulesMap]
  );

  const scheduleEntries = useMemo(
    () => Object.entries(schedulesMap),
    [schedulesMap]
  );

  const handleSearchClose = useCallback(() => {
    setSearchInfo(null);
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleEntries.map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button
                  colorScheme="green"
                  onClick={() => setSearchInfo({ tableId })}
                >
                  시간표 추가
                </Button>
                <Button
                  colorScheme="green"
                  mx="1px"
                  onClick={() => {
                    setSchedulesMap((prev) => ({
                      ...prev,
                      [`schedule-${Date.now()}`]: [...prev[tableId]],
                    }));
                  }}
                >
                  복제
                </Button>
                <Button
                  colorScheme="green"
                  isDisabled={disabledRemoveButton}
                  onClick={() => {
                    setSchedulesMap((prev) => {
                      delete prev[tableId];
                      return { ...prev };
                    });
                  }}
                >
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleDndProvider>
              <ScheduleTable
                key={`schedule-table-${index}`}
                schedules={schedules}
                tableId={tableId}
                onScheduleTimeClick={(timeInfo) =>
                  setSearchInfo({ tableId, ...timeInfo })
                }
                onDeleteButtonClick={({ day, time }) =>
                  setSchedulesMap((prev) => ({
                    ...prev,
                    [tableId]: prev[tableId].filter(
                      (schedule) =>
                        schedule.day !== day || !schedule.range.includes(time)
                    ),
                  }))
                }
              />
            </ScheduleDndProvider>
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchClose} />
    </>
  );
};
