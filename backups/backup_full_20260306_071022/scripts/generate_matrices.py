import itertools
import random
import json

def generate_matrix(n, k, t, m, max_games):
    pool = list(range(n))
    # Sample combinations if there are too many
    all_combos = list(itertools.combinations(pool, m))
    if len(all_combos) > 2000:
        target_combos = random.sample(all_combos, 2000)
    else:
        target_combos = list(all_combos)
        
    remaining = set(target_combos)
    games = []
    
    # Pre-select potential games
    potential = []
    for _ in range(2000):
        potential.append(tuple(sorted(random.sample(pool, k))))
    
    while remaining and len(games) < max_games:
        best_game = None
        best_covered = -1
        
        for pg in random.sample(potential, min(500, len(potential))):
            covered = 0
            pg_set = set(pg)
            for combo in remaining:
                overlap = len(pg_set.intersection(combo))
                if overlap >= t:
                    covered += 1
            if covered > best_covered:
                best_covered = covered
                best_game = pg
        
        if not best_game: break
        games.append(list(best_game))
        best_set = set(best_game)
        remaining = {c for c in remaining if len(best_set.intersection(c)) < t}
        print(f"Added game {len(games)}, remaining: {len(remaining)}")
        
    return games

results = {}
print("Garantindo 17-14-15...")
results["17-14-15"] = generate_matrix(17, 15, 14, 15, 8)
print("Garantindo 18-14-15...")
results["18-14-15"] = generate_matrix(18, 15, 14, 15, 24)
print("Garantindo 20-13-15...")
results["20-13-15"] = generate_matrix(20, 15, 13, 15, 16)
print("Garantindo 25-11-15...")
results["25-11-15"] = generate_matrix(25, 15, 11, 15, 4)

with open("scripts/matrices.json", "w") as f:
    json.dump(results, f)
print("\nDONE! Matrices saved to scripts/matrices.json")
