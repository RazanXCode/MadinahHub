using MHBackend.Data;
using Microsoft.EntityFrameworkCore;
using MHBackend.Auth;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("./Secrets/fir-fbe50-firebase-adminsdk-fbsvc-d437111a10.json"),
});


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


// Add CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
    builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());

});

// Add Swagger for API documentation
builder.Services.AddSwaggerGen();


// Register Database service
builder.Services.AddDbContext<MyAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")) // Note: Add your own Connection string in appsettings.json
);

// Add Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add Firebase authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Firebase";
    options.DefaultChallengeScheme = "Firebase";
})
.AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", null);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");

    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseCors("AllowAngularApp");

app.Run();
