import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import { Alert, Container } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", { method: "GET" });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [] } };
    }

    return {
      props: { statusCode: 200, users: await res.json() },
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [] } };
  }
}) satisfies GetServerSideProps<TGetServerSideProps>;

// function getPaginationRange(currentPage: number, totalPages: number) {
//   if (totalPages <= 7) {
//     return Array.from({ length: totalPages }, (_, i) => i + 1);
//   }

//   if (currentPage <= 4) {
//     return [1, 2, 3, 4, 5, null, totalPages];
//   }

//   if (currentPage >= totalPages - 3) {
//     return [1, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//   }

//   const middlePages = [currentPage - 1, currentPage, currentPage + 1];

//   return [1, ...middlePages, totalPages];
// }

export default function Home({ statusCode, users }: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentUsers = users.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = Math.ceil(users.length / postsPerPage);

  let pages = [];
  for (let i = 1; i <= pageNumbers; i++) {
    pages.push(i);
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First onClick={() => paginate(1)} />
            <Pagination.Prev onClick={() => paginate(currentPage - 1)} />

            {currentPage < 10 &&
              pages.slice(0, 10).map((number) => (
                <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                  {number}
                </Pagination.Item>
              ))}

            {currentPage > 10 && (
              <>
                <Pagination.Item onClick={() => paginate(1)}>{1}</Pagination.Item>
                <Pagination.Ellipsis disabled />
              </>
            )}

            {currentPage >= 10 &&
              pages.map((number) =>
                number >= Math.max(currentPage - 2, 1) && number <= Math.min(currentPage + 2, pageNumbers) ? (
                  <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                    {number}
                  </Pagination.Item>
                ) : null
              )}

            {currentPage < pageNumbers - 2 && (
              <>
                <Pagination.Ellipsis disabled />
                <Pagination.Item onClick={() => paginate(pageNumbers)}>{pageNumbers}</Pagination.Item>
              </>
            )}

            <Pagination.Next onClick={() => paginate(currentPage + 1)} />
            <Pagination.Last onClick={() => paginate(pageNumbers)} />
          </Pagination>
        </Container>
      </main>
    </>
  );
}
