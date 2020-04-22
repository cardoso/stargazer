import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';
import moment from 'moment';
import Moment from 'react-moment';

declare module 'react-table' {
  interface Row<D> extends UseExpandedRowProps<D> { }
  interface ColumnInstance<D extends object = {}> extends UseSortByColumnProps<D> { }
  interface TableOptions<D extends object = {}> extends UseSortByOptions<D> { }
}

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

  let totalThisWeek = 0;
  let totalLastWeek = 0;
  let totalTwoWeeksAgo = 0;

  const tableData = page.page.map((repo: any) => {
    const thisWeek = repo.item.stargazers.page.filter((curr: any) => {
      return moment().isSame(moment(curr.starredAt), "week");
    }).length;

    const lastWeek = repo.item.stargazers.page.filter((curr: any) => {
      const a = moment().isoWeek(moment().isoWeek() - 1);
      return a.isSame(moment(curr.starredAt), "week"); 
    }).length;

    const twoWeeksAgo = repo.item.stargazers.page.filter((curr: any) => {
      const a = moment().isoWeek(moment().isoWeek() - 2);
      return a.isSame(moment(curr.starredAt), "week"); 
    }).length;

    let symbol = ''
    if(thisWeek > lastWeek) symbol = '💚'
    if(thisWeek < lastWeek) symbol = '🔻'

    totalThisWeek += thisWeek;
    totalLastWeek += lastWeek;
    totalTwoWeeksAgo += twoWeeksAgo;

    const starredAt = repo.item.stargazers.page[0]?.starredAt;
    const name = (
      <span>
        <a href={`https://github.com/getstream/${repo.item.name}`}>{repo.item.name}</a>
        <a className="graphLink" href="#"> 📈</a>
      </span>
    );

    return {
      name: name, 
      stars: repo.item.stargazers.count, 
      thisWeek: `${thisWeek}${symbol}`,
      lastWeek: `${lastWeek}`,
      twoWeeksAgo: `${twoWeeksAgo}`,
      lastStarred: starredAt ? <Moment fromNow date={starredAt} /> : 'Never',
    }
  })

  let symbol = ''
  if(totalThisWeek > totalLastWeek) symbol = '💚'
  if(totalThisWeek < totalLastWeek) symbol = '🔻'

  return (
    <div>
      <p>This Week: +{totalThisWeek}{symbol}</p>
      <p>Last Week: +{totalLastWeek}</p>
      <p>Two Weeks Ago: +{totalTwoWeeksAgo}</p>
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