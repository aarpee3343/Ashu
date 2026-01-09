export async function GET() {
  return Response.json([
    {
      id: 1,
      name: "Dr. Rahul Sharma",
      category: "PHYSIOTHERAPIST",
      price: 800,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2"
    }
  ]);
}
