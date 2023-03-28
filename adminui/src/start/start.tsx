import {Box, ContentLayout, Header, SpaceBetween} from '@cloudscape-design/components';
import React, {ReactNode} from 'react';
import {Board, BoardItem, BoardProps} from '@cloudscape-design/board-components';
import {Notifications} from '../notifications';
import {LoaderFunction, useLoaderData} from 'react-router-dom';
import {firstValueFrom} from 'rxjs';
import {Logs, LogsService} from '../logs.service';
import LogsView from './logs-view';

interface boardItemData {
    title: string,
    content: string | ReactNode;
}

interface routeData {
    logs: Logs,
}

export function loadDashboardLoader(logs: LogsService, notifications: Notifications): LoaderFunction {
    return async () => {
        const l = await firstValueFrom(notifications.connectTo(logs.recentLogs()))
        return {
            logs: l,
        } as routeData;
    }
}

interface StartProps {
    logsService: LogsService;
}

export default function Start({logsService}: StartProps) {
    const {logs} = useLoaderData() as routeData;
    const [items, setItems] = React.useState<readonly BoardProps.Item<boardItemData>[]>([{
        id: 'players',
        columnSpan: 2,
        rowSpan: 4,
        data: {
            title: 'Players',
            content: 'Placeholder',
        },
    }, {
        id: 'logs',
        columnSpan: 2,
        rowSpan: 4,
        data: {
            title: 'Logs',
            content: <LogsView service={logsService} logs={logs}/>,
        },
    }]);

    return (
        <ContentLayout>
            <Board
                empty={
                    <Box textAlign="center" color="inherit">
                        <SpaceBetween size="xxs">
                            <div>
                                <Box variant="strong" color="inherit">
                                    No items
                                </Box>
                                <Box variant="p" color="inherit">
                                    There are no items on the dashboard.
                                </Box>
                            </div>
                        </SpaceBetween>
                    </Box>
                }
                items={items}
                renderItem={(item) => {
                    return <BoardItem
                        header={<Header>{item.data.title}</Header>}
                        i18nStrings={{
                            dragHandleAriaLabel: 'Drag handle',
                            dragHandleAriaDescription:
                                'Use Space or Enter to activate drag, arrow keys to move, Space or Enter to submit, or Escape to discard.',
                            resizeHandleAriaLabel: 'Resize handle',
                            resizeHandleAriaDescription:
                                'Use Space or Enter to activate resize, arrow keys to move, Space or Enter to submit, or Escape to discard.'
                        }}>
                        {item.data.content}
                    </BoardItem>
                }}
                onItemsChange={event => setItems(event.detail.items)}
                i18nStrings={{
                    liveAnnouncementDndStarted: operationType =>
                        operationType === 'resize'
                            ? 'Resizing'
                            : 'Dragging',
                    liveAnnouncementDndItemReordered: () => '',
                    liveAnnouncementDndItemResized: () => '',
                    liveAnnouncementDndItemInserted: () => '',
                    liveAnnouncementDndCommitted: () => '',
                    liveAnnouncementDndDiscarded: () => '',
                    liveAnnouncementItemRemoved: () => '',
                    navigationAriaLabel: 'Board navigation',
                    navigationAriaDescription: 'Click on non-empty item to move focus over',
                    navigationItemAriaLabel: item => item ? item.data.title : 'Empty'
                }}
            ></Board>
        </ContentLayout>
    )
}