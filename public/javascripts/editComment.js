const url = window.location.pathname;
const postId = url.substring(url.lastIndexOf('/') + 1);
$('.edit-comment').click(function () {
    const commentId = $(this).attr('id').slice(18)
    $.get(`/posts/${postId}/comments/${commentId}`, (data) => {
        $('#updateCommentForm').attr('action', `/posts/${postId}/comments/${commentId}?_method=PUT`);
        console.log($('#updateCommentForm').attr('action'))
        $('#updateCommentTextarea').val(data.text);
        $('#updateCommentModal').modal('show');
    })
})