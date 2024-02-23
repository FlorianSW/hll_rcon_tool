import React, {useState} from 'react';
import {LogLine, Logs} from '../logs.service';
import {PropertyFilter, PropertyFilterProps, Table} from '@cloudscape-design/components';
import {useRevalidator} from 'react-router-dom';
import {useServices} from "../di";

export default function LogsView() {
    const {logsService} = useServices();
    const [query, setQuery] = useState<PropertyFilterProps.Query>({tokens: [], operation: 'and'});
    const [logs, setLogs] = useState<Logs | undefined>(undefined);
    const revalidator = useRevalidator();

    function updateQuery(q: PropertyFilterProps.Query) {
        setQuery(q);
        logsService.setPlayerFilters(q.tokens.filter((t) => t.propertyKey === 'name').map((t) => t.value));
        const actions = q.tokens.filter((t) => t.propertyKey === 'type').map((t) => t.value);
        let inclusive = true;
        if (actions.length !== 0) {
            inclusive = q.tokens.find((t) => t.propertyKey === 'type')!!.operator === '=';
        }
        logsService.setActionFilters(actions, inclusive);
        revalidator.revalidate();
    }

    return <Table
        variant="embedded"
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
                removeTokenButtonAriaLabel: token =>
                    `Remove token ${token.propertyKey} ${token.operator} ${token.value}`,
                enteredTextLabel: text => `Use: "${text}"`
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
}