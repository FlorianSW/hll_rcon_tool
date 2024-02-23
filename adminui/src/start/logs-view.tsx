import React, {useEffect, useState} from 'react';
import {LogLine, Logs} from '../logs.service';
import {Button, Header, PropertyFilter, PropertyFilterProps, SpaceBetween, Table} from '@cloudscape-design/components';
import {useServices} from "../di";
import {BoardItem} from "@cloudscape-design/board-components";

export default function LogsView() {
    const {logsService} = useServices();
    const [query, setQuery] = useState<PropertyFilterProps.Query>({tokens: [], operation: 'and'});
    const [logs, setLogs] = useState<Logs | undefined>(undefined);
    const [refreshLogs, setRefreshLogs] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<number | undefined>(undefined);
    const [paused, setPaused] = useState(false);

    function updateQuery(q: PropertyFilterProps.Query) {
        setQuery(q);
        logsService.setPlayerFilters(q.tokens.filter((t) => t.propertyKey === 'name').map((t) => t.value));
        const actions = q.tokens.filter((t) => t.propertyKey === 'type').map((t) => t.value);
        let inclusive = true;
        if (actions.length !== 0) {
            inclusive = q.tokens.find((t) => t.propertyKey === 'type')!!.operator === '=';
        }
        logsService.setActionFilters(actions, inclusive);
    }

    useEffect(() => {
        const interval = setInterval(() => setRefreshLogs((v) => !v), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setLastRefresh((v) => (v || 0) + 1);

        if (paused || (lastRefresh !== undefined && lastRefresh < 10)) {
            return;
        }
        logsService.recentLogs().subscribe({
            next: (l) => {
                setLogs(l);
                setLastRefresh(0);
            },
        });
    }, [refreshLogs]);

    return <BoardItem
        header={<Header
            info={lastRefresh !== undefined ? <small style={{fontSize: '0.75rem'}}>Last refreshed {lastRefresh} seconds ago</small> : ''}
            actions={<SpaceBetween size={'s'}>
                <Button onClick={() => setPaused((v) => !v)}>{paused ? 'Resume' : 'Pause'}</Button>
            </SpaceBetween>}
        >
            Logs
        </Header>}
        i18nStrings={{
            dragHandleAriaLabel: 'Drag handle',
            dragHandleAriaDescription:
                'Use Space or Enter to activate drag, arrow keys to move, Space or Enter to submit, or Escape to discard.',
            resizeHandleAriaLabel: 'Resize handle',
            resizeHandleAriaDescription:
                'Use Space or Enter to activate resize, arrow keys to move, Space or Enter to submit, or Escape to discard.'
        }}>
        <Table
            variant="borderless"
            header={<PropertyFilter
                i18nStrings={{
                    filteringAriaLabel: 'your choice',
                    dismissAriaLabel: 'Dismiss',
                    filteringPlaceholder: 'Filter logs by property or value',
                    groupValuesText: 'Values',
                    groupPropertiesText: 'Properties',
                    operatorsText: 'Operators',
                    operationAndText: 'and',
                    operationOrText: 'or',
                    operatorLessText: 'Less than',
                    operatorLessOrEqualText: 'Less than or equal',
                    operatorGreaterText: 'Greater than',
                    operatorGreaterOrEqualText: 'Greater than or equal',
                    operatorContainsText: 'Contains',
                    operatorDoesNotContainText: 'Does not contain',
                    operatorEqualsText: 'Equals',
                    operatorDoesNotEqualText: 'Does not equal',
                    editTokenHeader: 'Edit filter',
                    propertyText: 'Property',
                    operatorText: 'Operator',
                    valueText: 'Value',
                    cancelActionText: 'Cancel',
                    applyActionText: 'Apply',
                    allPropertiesLabel: 'All properties',
                    tokenLimitShowMore: 'Show more',
                    tokenLimitShowFewer: 'Show fewer',
                    clearFiltersText: 'Clear filters',
                }}
                query={query}
                disableFreeTextFiltering={true}
                countText={logs?.logs.length + ' matches'}
                onChange={(e) => updateQuery(e.detail)}
                hideOperations={true}
                filteringProperties={[{
                    key: 'name',
                    operators: ['='],
                    propertyLabel: 'Name',
                    defaultOperator: '=',
                    groupValuesLabel: 'Name values',
                }, {
                    key: 'type',
                    operators: ['=', '!='],
                    propertyLabel: 'Type',
                    defaultOperator: '=',
                    groupValuesLabel: 'Type values',
                }]}
                filteringOptions={[
                    ...(logs?.players || []).map((k) => ({
                        propertyKey: 'name',
                        value: k
                    })),
                    ...(logs?.actions || []).map((k) => ({
                        propertyKey: 'type',
                        value: k
                    })),
                ]}
            />}
            resizableColumns={false}
            wrapLines={true}
            contentDensity="compact"
            items={logs?.logs || []}
            stickyHeader={true}
            columnDefinitions={[{
                id: 'timestamp',
                header: 'Time',
                cell: (i: LogLine) => i.timestamp.toLocaleString(),
            }, {
                id: 'action',
                header: 'Action',
                cell: (i: LogLine) => i.action,
            }, {
                id: 'message',
                header: 'Message',
                cell: (i: LogLine) => i.message,
            }]}
        />
    </BoardItem>
}