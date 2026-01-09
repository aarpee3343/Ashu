"use client";

export default function Register() {
  async function handleRegister(formData: FormData) {
    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });
  }

  return (
    <form action={handleRegister} className="max-w-md mx-auto">
      <input name="name" placeholder="Name" className="border p-2 w-full" />
      <input name="email" placeholder="Email" className="border p-2 w-full mt-2" />
      <input name="password" type="password" placeholder="Password" className="border p-2 w-full mt-2" />
      <button className="bg-green-600 text-white p-2 w-full mt-4">Register</button>
    </form>
  );
}
