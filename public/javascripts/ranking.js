(function () {
  $("#searchBar").change(() => {
    const pattern = $("#searchBar").val();
    $.get("/ranking/byPattern", { pattern }, (data) => {
      $("tbody").empty();
      data.forEach((record, index) => {
        $("tbody").append(`<tr>
                                      <th scope="row">${record.rank_number}</th>
                                      <td>${record.username}</td>
                                      <td>${record.points}</td>
                                 </tr>`);
      });
    });
  });
})();
