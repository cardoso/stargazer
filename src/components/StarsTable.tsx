import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import styled from 'styled-components';
import moment from 'moment';
import Moment from 'react-moment';
import orgName from '../lib/orgName';

declare module 'react-table' {
  interface Row<D> extends UseExpandedRowProps<D> { }
  interface ColumnInstance<D extends object = {}> extends UseSortByColumnProps<D> { }
  interface TableOptions<D extends object = {}> extends UseSortByOptions<D> { }
}

const ORG_MEMBERS = gql`
{ 
  organization(login: "${orgName}") {
    membersWithRole(first: 100) {
      page: edges {
        cursor: cursor
        item: node {
          login
        }
      }
    }
  }
}
`

function StarsTable(page: any) {
  const columns = React.useMemo(
    () => [
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Stars',
            accessor: 'stars',
          },
          {
            Header: 'This Week',
            accessor: 'thisWeek',
          },
          {
            Header: 'Last Week',
            accessor: 'lastWeek',
          },
          {
            Header: 'Two Weeks Ago',
            accessor: 'twoWeeksAgo',
          },
          {
            Header: 'Last Starred',
            accessor: 'lastStarred',
          },
        ],
    []
  );

  const { loading, error, data } = useQuery(ORG_MEMBERS);

  if(error) {
    return <p>Error: {error?.message}</p>;
  }

  if(loading) {
    return <p>Filtering stars from org members...</p>
  }

  let totalThisWeek = 0;
  let totalLastWeek = 0;
  let totalTwoWeeksAgo = 0;

  const filteredTotal = {
    thisWeek: 0,
    lastWeek: 0,
    twoWeeksAgo: 0
  }

  const filterUsernames = data.organization.membersWithRole.page.map((e: any) => e.item.login);

  const tableData = page.page.map((repo: any) => {
    const stargazers = repo.item.stargazers.page;
    
    const thisWeek = stargazers.filter((curr: any) => {
      return moment().isSame(moment(curr.starredAt), "week");
    });

    const lastWeek = stargazers.filter((curr: any) => {
      const a = moment().isoWeek(moment().isoWeek() - 1);
      return a.isSame(moment(curr.starredAt), "week"); 
    });

    const twoWeeksAgo = stargazers.filter((curr: any) => {
      const a = moment().isoWeek(moment().isoWeek() - 2);
      return a.isSame(moment(curr.starredAt), "week"); 
    });

    let symbol = ''
    if(thisWeek > lastWeek) symbol = '💚'
    if(thisWeek < lastWeek) symbol = '🔻'

    const filter = (e: any) => e.filter((curr: any) => {
      return !filterUsernames.includes(curr.item.login);
    });

    const filtered = {
      thisWeek: filter(thisWeek),
      lastWeek: filter(lastWeek),
      twoWeeksAgo: filter(twoWeeksAgo)
    }

    totalThisWeek += thisWeek.length;
    totalLastWeek += lastWeek.length;
    totalTwoWeeksAgo += twoWeeksAgo.length;

    filteredTotal.thisWeek += filtered.thisWeek.length;
    filteredTotal.lastWeek += filtered.lastWeek.length;
    filteredTotal.twoWeeksAgo += filtered.twoWeeksAgo.length;

    const starredAt = repo.item.stargazers.page[0]?.starredAt;
    const name = (
      <span>
        <a href={`https://github.com/${orgName}/${repo.item.name}`}>{repo.item.name}</a>
        <a className="graphLink" href="#"> 📈</a>
      </span>
    );

    return {
      name: name, 
      stars: repo.item.stargazers.count, 
      thisWeek: `${thisWeek.length} (${filtered.thisWeek.length})${symbol}`,
      lastWeek: `${lastWeek.length} (${filtered.lastWeek.length})`,
      twoWeeksAgo: `${twoWeeksAgo.length} (${filtered.twoWeeksAgo.length})`,
      lastStarred: starredAt ? <Moment fromNow date={starredAt} /> : 'Never',
    }
  })

  let symbol = ''
  if(totalThisWeek > totalLastWeek) symbol = '💚'
  if(totalThisWeek < totalLastWeek) symbol = '🔻'

  return (
    <div>
      <p>This Week: +{totalThisWeek} ({filteredTotal.thisWeek}){symbol}</p>
      <p>Last Week: +{totalLastWeek} ({filteredTotal.lastWeek})</p>
      <p>Two Weeks Ago: +{totalTwoWeeksAgo} ({filteredTotal.twoWeeksAgo})</p>
      <Styles>
        <Table columns={columns} data={tableData} />
      </Styles>
    </div>
  );
}

function Table({ columns, data }: any) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  }, useSortBy)

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid white;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid white;
      border-right: 1px solid white;

      a {
        color: white;
      }

      .graphLink {
        text-decoration: none;
      }

      :last-child {
        border-right: 0;
      }
    }
  }
`

export default StarsTable;