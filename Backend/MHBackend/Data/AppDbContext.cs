using Microsoft.EntityFrameworkCore;
using MHBackend.Models;

namespace MHBackend.Data{ public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the User entity
            modelBuilder.Entity<User>()
                .HasIndex(u => u.FirebaseUid)
                .IsUnique();
        }
    }
}