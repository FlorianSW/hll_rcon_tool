import {Box, ContentLayout, Header, SpaceBetween} from '@cloudscape-design/components';
import React, {ReactNode} from 'react';
import {Board, BoardItem, BoardProps} from '@cloudscape-design/board-components';
import LogsView from './logs-view';

interface boardItemData {
    title?: string,
    content?: string | ReactNode;

    item?: React.JSX.Element,
}

export default function Start() {
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
            item: <LogsView/>,
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
                    if (item.data.item) {
                        return item.data.item;
                    } else {
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
                    }
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
                    navigationItemAriaLabel: item => item?.data.title ? item.data.title : 'Empty'
                }}
            ></Board>
        </ContentLayout>
    )
}