import React,  { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import StarsTable from './StarsTable';

const STARGAZERS = gql`
  {
    organization(login: "getstream") {
      repositories(first: 100, isFork: false, isLocked: false, privacy: PUBLIC, ownerAffiliations: [OWNER], orderBy: {field: STARGAZERS, direction: DESC}) {
        page: edges {
          cursor: cursor
          item: node {
            name
            stargazers(first: 100, orderBy: {field: STARRED_AT, direction: DESC}) {
              count: totalCount
              page: edges {
                starredAt
                item: node {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

function StarsTotal() {
  const { loading, error, data } = useQuery(STARGAZERS);

  if(error) {
    return <p>Error: {error?.message}</p>;
  }

  if(loading) {
    return <p>Loading...</p>
  }

  const page = data?.organization.repositories.page
  const totalStars: Number = page.reduce((acc: Number, curr: any) => {
    return acc + curr.item.stargazers.count
  }, 0);

  return (
    <div>
      <p>{totalStars} stars</p>
      <StarsTable page={page} />
    </div>
  );
}

export default StarsTotal;