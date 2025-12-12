export default async function ModulesPage() {
  const res = await fetch("http://localhost:8002/modules", {
    cache: "no-store"
  });
  const modules = await res.json();

  return (
    <div>
      <h1>Modules</h1>
      <pre>{JSON.stringify(modules, null, 2)}</pre>
    </div>
  );
}
