export const insertToPod = async ({url, triples}) => {
  console.log(`put dat data!`, url)
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/sparql-update",
    },
    // @TKTK ??????
    body: `INSERT DATA { ${triples} }`
  })
  console.log(response)
  return response
}