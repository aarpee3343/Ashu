export default function Reviews({ reviews }: any) {
  return (
    <div>
      <h3>Reviews</h3>
      {reviews.map((r: any) => (
        <div key={r.id} className="border p-2 mb-2">
          ⭐ {r.rating}
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
