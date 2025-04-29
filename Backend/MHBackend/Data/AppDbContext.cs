using Microsoft.EntityFrameworkCore;
using MHBackend.Models;

namespace MHBackend.Data
{ 
    public class AppDbContext : DbContext
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
                
            // Make UserIdPublic unique as well
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserIdPublic)
                .IsUnique();
                
            // Configure the enum to be stored as a string
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();
        }
    }
}