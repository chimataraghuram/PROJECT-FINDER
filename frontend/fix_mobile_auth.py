with open("components/AuthButton.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the generic UserIcon with the actual user avatar image when minimal is true
content = content.replace(
    'if (user) return minimal ? <button onClick={onViewDashboard} className="p-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400"><UserIcon className="w-4 h-4" /></button> :',
    'if (user) return minimal ? <button onClick={onViewDashboard} className="rounded-full hover:scale-105 transition-transform"><img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} className="w-8 h-8 rounded-full border-2 border-orange-500/80 object-cover shadow-[0_0_10px_rgba(249,115,22,0.3)]" alt="Profile" /></button> :'
)

with open("components/AuthButton.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AuthButton minimal state.")
