import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/site/submit-button";
import { upsertProduct } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const games = await prisma.game.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      topupProducts: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-10">
      {games.map((game) => (
        <section key={game.id}>
          <h2 className="heading-bar text-lg font-extrabold">{game.name}</h2>

          <div className="mt-5 space-y-2">
            {game.topupProducts.map((product) => (
              <form
                key={product.id}
                action={upsertProduct}
                className="grid items-center gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_140px_90px_90px_auto]"
              >
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="gameId" value={game.id} />
                <Input name="name" defaultValue={product.name} required />
                <Input
                  name="price"
                  type="number"
                  min={1}
                  defaultValue={product.price}
                  required
                  aria-label="Price (MMK)"
                />
                <Input
                  name="sortOrder"
                  type="number"
                  defaultValue={product.sortOrder}
                  aria-label="Sort order"
                />
                <label className="flex items-center justify-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={product.active}
                    className="size-4 accent-[#e8362b]"
                  />
                  Active
                </label>
                <SubmitButton size="sm" variant="outline" pendingLabel="Saving…">
                  Save
                </SubmitButton>
              </form>
            ))}

            {/* New product row */}
            <form
              action={upsertProduct}
              className="grid items-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-3 sm:grid-cols-[1fr_140px_90px_90px_auto]"
            >
              <input type="hidden" name="gameId" value={game.id} />
              <Input name="name" placeholder="New package name" required />
              <Input
                name="price"
                type="number"
                min={1}
                placeholder="Price (Ks)"
                required
              />
              <Input
                name="sortOrder"
                type="number"
                placeholder="Sort"
                defaultValue={game.topupProducts.length}
              />
              <label className="flex items-center justify-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="size-4 accent-[#e8362b]"
                />
                Active
              </label>
              <SubmitButton size="sm" pendingLabel="Adding…">
                Add
              </SubmitButton>
            </form>
          </div>
        </section>
      ))}
    </div>
  );
}
